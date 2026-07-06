import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const orders = await Order.find({ customer: id })
      .select("items total paymentStatus fulfillmentStatus paymentProvider createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const monthlySpend = await Order.aggregate([
      { $match: { customer: require("mongoose").Types.ObjectId.createFromHexString(id) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    return NextResponse.json({ orders, monthlySpend });
  } catch (error) {
    console.error("GET /api/admin/users/[id]/activity error:", error);
    return NextResponse.json({ orders: [], monthlySpend: [] });
  }
}
