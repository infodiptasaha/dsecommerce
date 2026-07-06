import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Only admins can access user management" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const sort = searchParams.get("sort") || "-createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "all") {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query).select("name email role phone emailVerified createdAt addresses").sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const userIds = users.map((u) => u._id);
    const orderStats = await Order.aggregate([
      { $match: { customer: { $in: userIds } } },
      {
        $group: {
          _id: "$customer",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrder: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = new Map(orderStats.map((s) => [s._id.toString(), s]));

    const enrichedUsers = users.map((u) => {
      const stats = statsMap.get(u._id.toString());
      return {
        ...u,
        orderCount: stats?.orderCount || 0,
        totalSpent: stats?.totalSpent || 0,
        lastOrder: stats?.lastOrder || null,
      };
    });

    return NextResponse.json({
      users: enrichedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ users: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  }
}

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["customer", "admin", "manager", "support"]).default("customer"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Only admins can create users" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
      phone: parsed.data.phone || undefined,
    });

    return NextResponse.json({
      message: "User created",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
