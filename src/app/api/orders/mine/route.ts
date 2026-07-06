import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ orders: [] });
    }

    await dbConnect();

    const user = (await import("@/models/User")).default;
    const me = await user.findOne({ email: session.user.email }).select("_id").lean();
    if (!me) return NextResponse.json({ orders: [] });

    const orders = await Order.find({ customer: me._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders/mine error:", error);
    return NextResponse.json({ orders: [] });
  }
}
