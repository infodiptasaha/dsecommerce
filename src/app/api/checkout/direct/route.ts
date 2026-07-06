import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import { createPaymentSession, PaymentProvider } from "@/lib/payments";

interface DirectCheckoutBody {
  productId: string;
  quantity?: number;
  userId?: string;
  paymentProvider?: PaymentProvider;
  shippingAddress: {
    line1: string; line2?: string; city: string;
    state: string; postalCode: string; country: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: DirectCheckoutBody = await req.json();
    const { productId, quantity = 1, userId, paymentProvider = "stripe", shippingAddress } = body;

    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    if (!shippingAddress?.line1 || !shippingAddress?.city) {
      return NextResponse.json({ error: "Shipping address required" }, { status: 400 });
    }

    await dbConnect();

    const product = await Product.findOne({ _id: productId, isPublished: true }).lean();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.inventory < quantity) {
      return NextResponse.json({ error: `Only ${product.inventory} left in stock` }, { status: 400 });
    }

    const subtotal = product.price * quantity;
    const tax = Math.round(subtotal * 0.08);
    const shippingCost = subtotal > 500000 ? 0 : 9990;
    const total = subtotal + tax + shippingCost;

    const orderData: Record<string, any> = {
      items: [{
        product: product._id, title: product.title, sku: product.sku,
        quantity, price: product.price, image: product.images[0],
      }],
      shippingAddress,
      paymentProvider,
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      subtotal, tax, shippingCost, total,
    };

    if (userId) orderData.customer = userId;

    const order = await Order.create(orderData);

    const paymentSession = await createPaymentSession({
      provider: paymentProvider,
      items: [{ productId: product._id.toString(), name: product.title, image: product.images[0], price: product.price, quantity, sku: product.sku }],
      userId: userId ?? "guest",
      orderId: order._id.toString(),
      total,
    });

    if (paymentProvider === "stripe") order.stripeSessionId = paymentSession.sessionId;
    else if (paymentProvider === "paypal") order.paypalOrderId = paymentSession.sessionId;

    await order.save();

    if (userId) {
      await Cart.updateOne({ user: userId, "items.product": productId }, { $pull: { items: { product: productId } } });
    }

    return NextResponse.json({ url: paymentSession.url, orderId: order._id, provider: paymentProvider });
  } catch (error) {
    console.error("POST /api/checkout/direct error:", error);
    return NextResponse.json({ error: "Failed to create direct checkout" }, { status: 500 });
  }
}
