import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  userId?: mongoose.Types.ObjectId;
  identifier: string;
  channel: "email" | "sms";
  purpose: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  used: boolean;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    identifier: { type: String, required: true, index: true },
    channel: { type: String, enum: ["email", "sms"], required: true },
    purpose: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OtpSchema.index({ identifier: 1, purpose: 1, used: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;
