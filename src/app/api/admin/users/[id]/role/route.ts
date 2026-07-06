import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendNotification } from "@/lib/notifications/dispatcher";

const assignRoleSchema = z.object({
  role: z.enum(["customer", "admin", "manager", "support"]),
  permissions: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Only admins can change user roles" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = assignRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await dbConnect();
    const targetUser = await User.findById(id);
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const oldRole = targetUser.role;
    targetUser.role = parsed.data.role;
    if (parsed.data.permissions) targetUser.permissions = parsed.data.permissions;
    await targetUser.save();

    if (targetUser.email) {
      await sendNotification({
        channel: "email", event: "welcome",
        to: targetUser.email, userId: targetUser._id.toString(),
        data: {
          name: targetUser.name, storeName: process.env.STORE_NAME ?? "Our Store",
          promoTitle: "Your role has been updated",
          promoBody: `You are now a "${parsed.data.role}".`,
          promoUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          shopUrl: `${process.env.NEXT_PUBLIC_SITE_URL}`,
        },
      });
    }

    return NextResponse.json({
      message: "Role updated",
      user: { id: targetUser._id, name: targetUser.name, email: targetUser.email, oldRole, newRole: targetUser.role },
    });
  } catch (error) {
    console.error("PUT /api/admin/users/[id]/role error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
