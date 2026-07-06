import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { sendNotification } from "@/lib/notifications/dispatcher";

async function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const mod = await (Function("return import('stripe')")() as Promise<typeof import("stripe")>);
  return new mod.default(key);
}

export async function POST(req: NextRequest) {
  const stripe = await getStripeClient();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Stripe webhook secret not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await dbConnect();

    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (existingOrder) return NextResponse.json({ received: true });

    const orderItems = JSON.parse(session.metadata!.items);
    const userId = session.metadata!.userId;

    const productIds = orderItems.map((i: any) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(dbProducts.map((p: any) => [p._id.toString(), p]));

    let subtotal = 0;
    const validatedItems = orderItems.map((item: any) => {
      const dbProduct = productMap.get(item.productId);
      const price = dbProduct?.price ?? item.price;
      subtotal += price * item.quantity;
      return { ...item, price };
    });

    const tax = Math.round(subtotal * 0.08);
    const shippingCost = subtotal > 500000 ? 0 : 99900;
    const total = subtotal + tax + shippingCost;

    const mongooseSession = await require("mongoose").startSession();
    mongooseSession.startTransaction();

    try {
      for (const item of validatedItems) {
        const result = await Product.findByIdAndUpdate(item.product, { $inc: { inventory: -item.quantity } }, { new: true, session: mongooseSession });
        if (!result || result.inventory < 0) throw new Error(`Insufficient inventory for ${item.product}`);
      }

      const orderData: Record<string, any> = {
        items: validatedItems,
        shippingAddress: session.shipping_details?.address ?? { line1: "N/A", city: "N/A", state: "N/A", postalCode: "N/A", country: "US" },
        paymentProvider: "stripe",
        paymentStatus: "paid",
        fulfillmentStatus: "unfulfilled",
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        subtotal, tax, shippingCost, total,
      };
      if (userId !== "guest") orderData.customer = userId;

      const order = await Order.create([orderData], { session: mongooseSession });

      await mongooseSession.commitTransaction();

      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        const user = userId !== "guest" ? await User.findById(userId).lean() : null;

        await sendNotification({
          channel: "email",
          event: "order_paid",
          to: customerEmail,
          userId: userId !== "guest" ? userId : undefined,
          data: {
            orderId: order[0]._id.toString(),
            total: (total / 100).toFixed(2),
            name: user?.name || session.customer_details?.name || "Customer",
            itemCount: validatedItems.length,
            items: validatedItems.map((item: any) => `${item.title} x${item.quantity}`).join(", "),
            trackingUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/track-order`,
            storeName: process.env.STORE_NAME ?? "ShopHub",
          },
        });
      }

      console.log(`Order ${order[0]._id} created for session ${session.id}`);
    } catch (err) {
      await mongooseSession.abortTransaction();
      console.error("Order creation failed:", err);
    } finally {
      mongooseSession.endSession();
    }
  }

  return NextResponse.json({ received: true });
}
