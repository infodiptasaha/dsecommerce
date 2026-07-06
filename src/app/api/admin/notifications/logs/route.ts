import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import NotificationLog from "@/models/NotificationLog";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const channel = searchParams.get("channel");
    const event = searchParams.get("event");
    const status = searchParams.get("status");

    const filter: Record<string, any> = {};
    if (channel) filter.channel = channel;
    if (event) filter.event = event;
    if (status) filter.status = status;

    const [logs, total] = await Promise.all([
      NotificationLog.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit).lean(),
      NotificationLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
