import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationLog extends Document {
  channel: "email" | "sms";
  event: string;
  to: string;
  userId?: mongoose.Types.ObjectId;
  status: "sent" | "failed" | "queued";
  provider: string;
  subject?: string;
  body: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    channel: { type: String, enum: ["email", "sms"], required: true, index: true },
    event: { type: String, required: true, index: true },
    to: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: ["sent", "failed", "queued"], default: "sent" },
    provider: { type: String, required: true },
    subject: String,
    body: { type: String, required: true },
    error: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

NotificationLogSchema.index({ createdAt: -1 });
NotificationLogSchema.index({ userId: 1, createdAt: -1 });

const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema);
export default NotificationLog;
