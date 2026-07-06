import { PaymentSession } from "./types";

export async function createCodSession(params: {
  orderId: string;
}): Promise<PaymentSession> {
  return {
    provider: "cod",
    sessionId: `cod_${params.orderId}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?provider=cod&order_id=${params.orderId}`,
    expiresAt: Date.now() / 1000 + 7 * 24 * 3600,
  };
}
