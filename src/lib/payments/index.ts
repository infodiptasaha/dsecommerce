import { PaymentProvider, PaymentSession } from "./types";
import { createStripeSession } from "./stripe";
import { createPayPalSession } from "./paypal";
import { createCodSession } from "./cod";

export type { PaymentProvider, PaymentSession };

interface CreatePaymentParams {
  provider: PaymentProvider;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    sku: string;
  }>;
  userId: string;
  orderId: string;
  total: number;
}

export async function createPaymentSession(
  params: CreatePaymentParams
): Promise<PaymentSession> {
  switch (params.provider) {
    case "stripe":
      return createStripeSession(params);
    case "paypal":
      return createPayPalSession(params);
    case "cod":
      return createCodSession({ orderId: params.orderId });
    default:
      throw new Error(`Unsupported payment provider: ${params.provider}`);
  }
}
