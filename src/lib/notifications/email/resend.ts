export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from: params.from ?? process.env.EMAIL_FROM ?? "noreply@yourdomain.com",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error("Resend email error:", error.message);
    return { success: false, error: error.message };
  }
}
