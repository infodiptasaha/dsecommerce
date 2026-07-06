import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import NotificationSetting from "@/models/NotificationSetting";

export async function GET() {
  try {
    await dbConnect();
    const settings = await NotificationSetting.find().sort("event").lean();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { settings } = await req.json();
    await dbConnect();

    const ops = settings.map((s: any) => ({
      updateOne: {
        filter: { event: s.event, channel: s.channel },
        update: { $set: { enabled: s.enabled, subject: s.subject, body: s.body } },
        upsert: true,
      },
    }));

    await NotificationSetting.bulkWrite(ops);
    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
