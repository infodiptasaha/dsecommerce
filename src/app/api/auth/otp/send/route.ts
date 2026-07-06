import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { generateOtp } from "@/lib/otp";

const sendOtpSchema = z.object({
  identifier: z.string().email().or(z.string().regex(/^\+\d{10,15}$/)),
  channel: z.enum(["email", "sms"]),
  purpose: z.enum(["verification", "password_reset", "login"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { identifier, channel, purpose } = parsed.data;
    await dbConnect();

    const recentOtps = await Otp.countDocuments({
      identifier, purpose,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });

    if (recentOtps >= 3) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const user = await User.findOne(
      channel === "email" ? { email: identifier } : { phone: identifier }
    ).select("_id");

    await generateOtp({ userId: user?._id?.toString(), identifier, channel, purpose });

    return NextResponse.json({ message: "OTP sent", expiresIn: 600 });
  } catch (error) {
    console.error("POST /api/auth/otp/send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
