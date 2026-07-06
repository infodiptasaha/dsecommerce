import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select("-password").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const orders = await Order.find({ customer: id }).sort({ createdAt: -1 }).limit(10).lean();

    const orderStats = await Order.aggregate([
      { $match: { customer: user._id } },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          lastOrder: { $max: "$createdAt" },
          firstOrder: { $min: "$createdAt" },
        },
      },
    ]);

    return NextResponse.json({
      user: {
        ...user,
        orderCount: orderStats[0]?.orderCount || 0,
        totalSpent: orderStats[0]?.totalSpent || 0,
        avgOrderValue: orderStats[0]?.avgOrderValue || 0,
        lastOrder: orderStats[0]?.lastOrder || null,
        firstOrder: orderStats[0]?.firstOrder || null,
      },
      orders,
    });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["customer", "admin", "manager", "support"]).optional(),
  phone: z.string().optional().nullable(),
  emailVerified: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.email) {
      const existing = await User.findOne({ email: parsed.data.email, _id: { $ne: id } });
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const user = await User.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).select("-password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User updated", user });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
      }
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
