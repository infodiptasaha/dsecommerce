import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Only admins can reset passwords" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: `Password reset for ${user.name}` });
  } catch (error) {
    console.error("PUT /api/admin/users/[id]/password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
