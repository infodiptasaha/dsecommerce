import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationSetting extends Document {
  event: string;
  channel: "email" | "sms";
  enabled: boolean;
  subject?: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingSchema = new Schema<INotificationSetting>(
  {
    event: {
      type: String,
      required: true,
      enum: [
        "order_created", "order_paid", "order_shipped", "order_delivered",
        "order_cancelled", "otp_verification", "password_reset", "welcome", "promo",
      ],
    },
    channel: { type: String, enum: ["email", "sms"], required: true },
    enabled: { type: Boolean, default: true },
    subject: String,
    body: { type: String, required: true },
  },
  { timestamps: true }
);

NotificationSettingSchema.index({ event: 1, channel: 1 }, { unique: true });

const NotificationSetting: Model<INotificationSetting> =
  mongoose.models.NotificationSetting ||
  mongoose.model<INotificationSetting>("NotificationSetting", NotificationSettingSchema);
export default NotificationSetting;
