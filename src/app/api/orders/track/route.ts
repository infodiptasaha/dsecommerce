import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") || searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const sessionId = searchParams.get("sessionId");

    if (!orderId && !orderNumber && !sessionId) {
      return NextResponse.json({ error: "Order ID, order number, or session ID is required" }, { status: 400 });
    }

    await dbConnect();

    let order;

    if (orderNumber) {
      order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() })
        .select("orderNumber total paymentStatus paymentProvider fulfillmentStatus items createdAt")
        .lean();
    } else if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
      }
      order = await Order.findById(orderId)
        .select("orderNumber total paymentStatus paymentProvider fulfillmentStatus items createdAt")
        .lean();
    } else {
      order = await Order.findOne({ stripeSessionId: sessionId })
        .select("orderNumber total paymentStatus paymentProvider fulfillmentStatus items createdAt")
        .lean();
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/orders/track error:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
