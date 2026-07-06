import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendNotification } from "@/lib/notifications/dispatcher";

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const paypalOrderId = body.resource?.id;

  if (!paypalOrderId) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  try {
    const accessToken = await getPayPalAccessToken();
    const res = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const paypalOrder = await res.json();

    if (paypalOrder.status !== "COMPLETED") {
      return NextResponse.json({ error: "Order not completed" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findOne({ paypalOrderId });
    if (!order || order.paymentStatus === "paid") return NextResponse.json({ received: true });

    const mongooseSession = await require("mongoose").startSession();
    mongooseSession.startTransaction();

    try {
      for (const item of order.items) {
        const result = await Product.findByIdAndUpdate(item.product, { $inc: { inventory: -item.quantity } }, { new: true, session: mongooseSession });
        if (!result || result.inventory < 0) throw new Error(`Insufficient inventory for ${item.product}`);
      }

      order.paymentStatus = "paid";
      await order.save({ session: mongooseSession });
      await mongooseSession.commitTransaction();

      if (order.customer) {
        await sendNotification({
          channel: "email", event: "order_paid",
          to: "", userId: order.customer.toString(),
          data: { orderId: order._id, total: (order.total / 100).toFixed(2) },
        });
      }
    } catch (err) {
      await mongooseSession.abortTransaction();
      throw err;
    } finally {
      mongooseSession.endSession();
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
