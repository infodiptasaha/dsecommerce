import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.fulfillmentStatus = status;
    }

    if (search) {
      // Search by order ID or customer name/email
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id").lean();

      const userIds = users.map((u) => u._id);

      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customer: { $in: userIds } },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ orders: [] });
  }
}
