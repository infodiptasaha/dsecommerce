import dbConnect from "@/lib/dbConnect";
import NotificationSetting from "@/models/NotificationSetting";
import NotificationLog from "@/models/NotificationLog";
import { sendSms } from "./sms/twilio";
import { sendEmail } from "./email/resend";
import { SendNotificationParams, NotificationChannel } from "./types";

const defaultTemplates: Record<string, Record<NotificationChannel, { subject?: string; body: string }>> = {
  order_created: {
    email: {
      subject: "Order #{{orderId}} Confirmed",
      body: "<h1>Thanks for your order!</h1><p>Order <strong>#{{orderId}}</strong> has been received.</p><p>Total: <strong>\${{total}}</strong></p><p>We'll notify you when it ships.</p>",
    },
    sms: { body: "Order #{{orderId}} confirmed! Total: ${{total}}. We'll notify you when it ships." },
  },
  order_paid: {
    email: {
      subject: "Payment Received - Order #{{orderId}}",
      body: "<h1>Payment Confirmed</h1><p>We've received your payment of <strong>\${{total}}</strong> for order #{{orderId}}.</p><p>Your order is being processed.</p>",
    },
    sms: { body: "Payment of ${{total}} received for order #{{orderId}}. Processing now!" },
  },
  order_shipped: {
    email: {
      subject: "Your Order #{{orderId}} Has Shipped!",
      body: "<h1>Your order is on its way!</h1><p>Order #{{orderId}} has been shipped.</p><p>Tracking: <a href='{{trackingUrl}}'>{{trackingNumber}}</a></p><p>Estimated delivery: {{estimatedDelivery}}</p>",
    },
    sms: { body: "Order #{{orderId}} shipped! Track: {{trackingUrl}}. ETA: {{estimatedDelivery}}" },
  },
  order_delivered: {
    email: {
      subject: "Order #{{orderId}} Delivered",
      body: "<h1>Delivered!</h1><p>Order #{{orderId}} has been delivered.</p><p>We hope you love your purchase!</p>",
    },
    sms: { body: "Order #{{orderId}} delivered. Enjoy your purchase!" },
  },
  order_cancelled: {
    email: {
      subject: "Order #{{orderId}} Cancelled",
      body: "<h1>Order Cancelled</h1><p>Order #{{orderId}} has been cancelled.</p><p>Refund: {{refundStatus}}</p>",
    },
    sms: { body: "Order #{{orderId}} cancelled. {{refundStatus}}" },
  },
  otp_verification: {
    email: {
      subject: "Your Verification Code",
      body: "<h1>Verify your account</h1><p>Your one-time code is:</p><h2 style='font-size:32px;letter-spacing:8px;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px;'>{{otp}}</h2><p>This code expires in {{expiresIn}} minutes.</p><p>If you didn't request this, ignore this email.</p>",
    },
    sms: { body: "Your verification code is {{otp}}. Expires in {{expiresIn}} minutes. Do not share this code." },
  },
  password_reset: {
    email: {
      subject: "Reset Your Password",
      body: "<h1>Password Reset</h1><p>Click the link below to reset your password:</p><a href='{{resetUrl}}' style='display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;'>Reset Password</a><p>This link expires in {{expiresIn}} minutes.</p>",
    },
    sms: { body: "Your password reset code is {{otp}}. Expires in {{expiresIn}} minutes." },
  },
  welcome: {
    email: {
      subject: "Welcome to {{storeName}}!",
      body: "<h1>Welcome, {{name}}!</h1><p>Thanks for joining {{storeName}}.</p><p>Start shopping: <a href='{{shopUrl}}'>Browse Products</a></p>",
    },
    sms: { body: "Welcome to {{storeName}}, {{name}}! Start shopping at {{shopUrl}}" },
  },
  promo: {
    email: {
      subject: "{{promoTitle}}",
      body: "<h1>{{promoTitle}}</h1><p>{{promoBody}}</p><a href='{{promoUrl}}' style='display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:6px;'>Shop Now</a>",
    },
    sms: { body: "{{promoTitle}} - {{promoBody}} {{promoUrl}}" },
  },
};

function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
  });
}

export async function sendNotification(
  params: SendNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    const setting = await NotificationSetting.findOne({
      event: params.event,
      channel: params.channel,
    });

    const defaults = defaultTemplates[params.event]?.[params.channel];
    const subject = setting?.subject || defaults?.subject;
    const body = setting?.body || defaults?.body || "";
    const enabled = setting?.enabled ?? true;

    if (!enabled) {
      return { success: true };
    }

    const renderedBody = renderTemplate(body, params.data);
    const renderedSubject = subject ? renderTemplate(subject, params.data) : undefined;

    let result: { success: boolean; id?: string; sid?: string; error?: string };

    if (params.channel === "email") {
      result = await sendEmail({
        to: params.to,
        subject: renderedSubject ?? "Notification",
        html: renderedBody,
      });
    } else {
      result = await sendSms({ to: params.to, body: renderedBody });
    }

    await NotificationLog.create({
      channel: params.channel,
      event: params.event,
      to: params.to,
      userId: params.userId,
      status: result.success ? "sent" : "failed",
      provider: params.channel === "email" ? "resend" : "twilio",
      subject: renderedSubject,
      body: renderedBody,
      error: result.error,
    });

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error("sendNotification error:", error);
    return { success: false, error: error.message };
  }
}
