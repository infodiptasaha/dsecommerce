import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";

const verifyOtpSchema = z.object({
  identifier: z.string(),
  purpose: z.string(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await verifyOtp(parsed.data);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified", userId: result.userId });
  } catch (error) {
    console.error("POST /api/auth/otp/verify error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
