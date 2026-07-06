import { PaymentSession } from "./types";

export async function createStripeSession(params: {
  items: Array<{ name: string; image: string; price: number; quantity: number; productId: string; sku: string }>;
  userId: string;
  orderId: string;
}): Promise<PaymentSession> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured. Please add your STRIPE_SECRET_KEY to .env.local");
  }
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });

  const lineItems = params.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: [item.image],
        metadata: { productId: item.productId, sku: item.sku },
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?canceled=true`,
    metadata: { userId: params.userId, orderId: params.orderId, items: JSON.stringify(params.items.map(i => ({ productId: i.productId, quantity: i.quantity }))) },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return {
    provider: "stripe",
    sessionId: session.id,
    url: session.url!,
    expiresAt: session.expires_at!,
  };
}
