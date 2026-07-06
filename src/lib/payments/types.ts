export type PaymentProvider = "stripe" | "paypal" | "cod";

export interface PaymentSession {
  provider: PaymentProvider;
  sessionId: string;
  url: string;
  expiresAt: number;
}
