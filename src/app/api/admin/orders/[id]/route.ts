import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const order = await Order.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ message: "Order updated", order });
  } catch (error) {
    console.error("PUT /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
