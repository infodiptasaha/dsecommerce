export async function sendSms(params: {
  to: string;
  body: string;
}): Promise<{ success: boolean; sid?: string; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return { success: false, error: "Twilio credentials not configured" };
  }
  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(sid, token);
    const message = await client.messages.create({
      body: params.body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: params.to,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error("Twilio SMS error:", error.message);
    return { success: false, error: error.message };
  }
}
