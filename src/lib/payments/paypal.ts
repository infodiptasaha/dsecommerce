import { PaymentSession } from "./types";

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function createPayPalSession(params: {
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  orderId: string;
}): Promise<PaymentSession> {
  const accessToken = await getPayPalAccessToken();

  const order = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.orderId,
          amount: {
            currency_code: "USD",
            value: (params.total / 100).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: (params.total / 100).toFixed(2),
              },
            },
          },
          items: params.items.map((item) => ({
            name: item.name,
            unit_amount: { currency_code: "USD", value: (item.price / 100).toFixed(2) },
            quantity: item.quantity.toString(),
          })),
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?provider=paypal&order_id=${params.orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?canceled=true`,
      },
    }),
  });

  const data = await order.json();
  const approveUrl = data.links?.find((l: any) => l.rel === "approve")?.href;

  return {
    provider: "paypal",
    sessionId: data.id,
    url: approveUrl,
    expiresAt: Date.now() / 1000 + 3600,
  };
}
