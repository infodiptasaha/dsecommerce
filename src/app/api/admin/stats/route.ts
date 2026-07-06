import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    const [totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return NextResponse.json({ totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0, recentOrders: [] });
  }
}
