import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Otp from "@/models/Otp";
import { sendNotification } from "@/lib/notifications/dispatcher";

export interface GenerateOtpParams {
  userId?: string;
  identifier: string;
  channel: "email" | "sms";
  purpose: "verification" | "password_reset" | "login";
  expiresInSeconds?: number;
}

export async function generateOtp(params: GenerateOtpParams) {
  await dbConnect();

  await Otp.updateMany(
    { identifier: params.identifier, purpose: params.purpose, used: false },
    { used: true }
  );

  const code = crypto.randomInt(100000, 999999).toString();
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + (params.expiresInSeconds ?? 600) * 1000);

  await Otp.create({
    userId: params.userId,
    identifier: params.identifier,
    channel: params.channel,
    purpose: params.purpose,
    code: hashedCode,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
  });

  await sendNotification({
    channel: params.channel,
    event: "otp_verification",
    to: params.identifier,
    userId: params.userId,
    data: {
      otp: code,
      expiresIn: Math.floor((params.expiresInSeconds ?? 600) / 60),
    },
  });

  return { success: true, expiresAt };
}

export async function verifyOtp(params: {
  identifier: string;
  purpose: string;
  code: string;
}): Promise<{ valid: boolean; userId?: string; error?: string }> {
  await dbConnect();

  const record = await Otp.findOne({
    identifier: params.identifier,
    purpose: params.purpose,
    used: false,
  }).sort({ createdAt: -1 });

  if (!record) return { valid: false, error: "No OTP found. Request a new one." };
  if (record.expiresAt < new Date()) return { valid: false, error: "OTP expired. Request a new one." };
  if (record.attempts >= record.maxAttempts) {
    await Otp.updateOne({ _id: record._id }, { used: true });
    return { valid: false, error: "Too many attempts. Request a new OTP." };
  }

  await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });

  const hashedInput = crypto.createHash("sha256").update(params.code).digest("hex");
  if (hashedInput !== record.code) return { valid: false, error: "Invalid code." };

  await Otp.updateOne({ _id: record._id }, { used: true });
  return { valid: true, userId: record.userId?.toString() };
}
