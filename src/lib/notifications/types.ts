export type NotificationChannel = "email" | "sms";

export type NotificationEvent =
  | "order_created"
  | "order_paid"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "otp_verification"
  | "password_reset"
  | "welcome"
  | "promo";

export interface SendNotificationParams {
  channel: NotificationChannel;
  event: NotificationEvent;
  to: string;
  userId?: string;
  data: Record<string, any>;
}
