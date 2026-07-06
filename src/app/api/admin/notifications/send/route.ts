import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendNotification } from "@/lib/notifications/dispatcher";

const bulkNotificationSchema = z.object({
  channel: z.enum(["email", "sms"]),
  event: z.enum(["promo"]),
  targetRole: z.enum(["customer", "admin", "manager", "support"]).optional(),
  targetUserIds: z.array(z.string()).optional(),
  subject: z.string().optional(),
  body: z.string(),
  data: z.record(z.string(), z.any()),
});

export async function POST(req: NextRequest) {
  try {
    // Verify admin in production
    const body = await req.json();
    const parsed = bulkNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await dbConnect();

    const filter: Record<string, any> = {};
    if (parsed.data.targetUserIds) filter._id = { $in: parsed.data.targetUserIds };
    else if (parsed.data.targetRole) filter.role = parsed.data.targetRole;

    if (parsed.data.channel === "email") {
      filter.email = { $exists: true, $ne: null };
      filter["notificationPreferences.email.promos"] = true;
    } else {
      filter.phone = { $exists: true, $ne: null };
      filter["notificationPreferences.sms.promos"] = true;
    }

    const users = await User.find(filter).select("email phone name").lean();

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      const to = parsed.data.channel === "email" ? user.email : user.phone;
      if (!to) continue;

      const result = await sendNotification({
        channel: parsed.data.channel, event: parsed.data.event, to,
        userId: user._id.toString(),
        data: {
          ...parsed.data.data, name: user.name,
          promoTitle: parsed.data.subject ?? "Special Offer",
          promoBody: parsed.data.body,
          promoUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/promos`,
          storeName: process.env.STORE_NAME ?? "Our Store",
          shopUrl: `${process.env.NEXT_PUBLIC_SITE_URL}`,
        },
      });

      if (result.success) sent++;
      else failed++;
    }

    return NextResponse.json({ message: "Notifications sent", total: users.length, sent, failed });
  } catch (error) {
    console.error("POST /api/admin/notifications/send error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
