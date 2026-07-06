import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AnalyticsEvent from "@/models/Analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();

    await AnalyticsEvent.create({
      event: body.event,
      productId: body.productId,
      productTitle: body.productTitle,
      productSlug: body.productSlug,
      category: body.category,
      price: body.price,
      userId: body.userId,
      sessionId: body.sessionId,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/analytics/track error:", error);
    return NextResponse.json({ ok: true });
  }
}
