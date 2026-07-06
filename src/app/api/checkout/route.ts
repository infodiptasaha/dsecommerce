import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { createPaymentSession, PaymentProvider } from "@/lib/payments";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

function isKeyConfigured(key: string | undefined): boolean {
  return !!key && key !== "..." && !key.endsWith("_...");
}

export async function POST(req: NextRequest) {
  try {
    const { items, userId, paymentProvider = "cod", shippingAddress }: {
      items: CheckoutItem[];
      userId?: string;
      paymentProvider?: PaymentProvider;
      shippingAddress?: { fullName: string; address: string; city: string; state: string; postalCode: string; country: string; phone: string; email: string };
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Check if requested provider is configured, fall back to COD if not
    let provider: PaymentProvider = paymentProvider;
    if (provider === "stripe" && !isKeyConfigured(process.env.STRIPE_SECRET_KEY)) {
      provider = "cod";
    } else if (provider === "paypal" && !isKeyConfigured(process.env.PAYPAL_CLIENT_ID)) {
      provider = "cod";
    }

    const allowedProviders: PaymentProvider[] = ["stripe", "paypal", "cod"];
    if (!allowedProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
    }

    await dbConnect();

    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds }, isPublished: true }).lean();
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    const orderItems: Array<{
      product: string; title: string; sku: string;
      quantity: number; price: number; image: string;
    }> = [];

    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      if (product.inventory < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for "${product.title}"` }, { status: 400 });
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id.toString(),
        title: product.title,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0] || "",
      });
    }

    const tax = Math.round(subtotal * 0.08);
    const shippingCost = subtotal > 500000 ? 0 : 9990;
    const total = subtotal + tax + shippingCost;

    const addr = shippingAddress;
    const orderData: Record<string, any> = {
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      items: orderItems,
      shippingAddress: {
        line1: addr?.address || "Pending",
        city: addr?.city || "Pending",
        state: addr?.state || "Pending",
        postalCode: addr?.postalCode || "Pending",
        country: addr?.country || "BD",
      },
      paymentProvider: provider,
      paymentStatus: provider === "cod" ? "pending" : "pending",
      fulfillmentStatus: "unfulfilled",
      subtotal, tax, shippingCost, total,
    };
    if (userId) orderData.customer = userId;

    const order = await Order.create(orderData);

    let paymentSession;
    try {
      paymentSession = await createPaymentSession({
        provider,
        items: orderItems.map((item) => ({ ...item, productId: item.product, name: item.title })),
        userId: userId ?? "guest",
        orderId: order._id.toString(),
        total,
      });
    } catch (payErr) {
      console.error("Payment session error:", payErr);
      // If payment provider fails, still return the order with COD fallback
      paymentSession = {
        provider: "cod" as PaymentProvider,
        sessionId: `cod_${order._id}`,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?provider=cod&order_id=${order._id}`,
        expiresAt: Date.now() / 1000 + 7 * 24 * 3600,
      };
      order.paymentProvider = "cod";
    }

    if (provider === "stripe") order.stripeSessionId = paymentSession.sessionId;
    else if (provider === "paypal") order.paypalOrderId = paymentSession.sessionId;

    await order.save();

    return NextResponse.json({ url: paymentSession.url, orderId: order._id, provider });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
