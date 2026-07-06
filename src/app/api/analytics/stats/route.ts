import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AnalyticsEvent from "@/models/Analytics";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") ?? "7");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalImpressions,
      totalClicks,
      totalCartAdds,
      totalCheckouts,
      totalPurchases,
      topProducts,
      topCategories,
      dailyFunnel,
      recentEvents,
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({ event: "impression", createdAt: { $gte: since } }),
      AnalyticsEvent.countDocuments({ event: "click", createdAt: { $gte: since } }),
      AnalyticsEvent.countDocuments({ event: "add_to_cart", createdAt: { $gte: since } }),
      AnalyticsEvent.countDocuments({ event: "checkout", createdAt: { $gte: since } }),
      AnalyticsEvent.countDocuments({ event: "purchase", createdAt: { $gte: since } }),

      AnalyticsEvent.aggregate([
        { $match: { event: "click", createdAt: { $gte: since }, productId: { $exists: true } } },
        { $group: { _id: "$productId", title: { $first: "$productTitle" }, clicks: { $sum: 1 }, impressions: { $sum: { $cond: [{ $eq: ["$event", "impression"] }, 1, 0] } } } },
        { $sort: { clicks: -1 } },
        { $limit: 10 },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: since }, category: { $exists: true, $ne: null } } },
        { $group: { _id: "$category", total: { $sum: 1 }, impressions: { $sum: { $cond: [{ $eq: ["$event", "impression"] }, 1, 0] } }, clicks: { $sum: { $cond: [{ $eq: ["$event", "click"] }, 1, 0] } }, carts: { $sum: { $cond: [{ $eq: ["$event", "add_to_cart"] }, 1, 0] } } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, event: "$event" }, count: { $sum: 1 } } },
        { $sort: { "_id.date": 1 } },
      ]),

      AnalyticsEvent.find().sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const funnel = [
      { step: "Impressions", count: totalImpressions, color: "bg-blue-500" },
      { step: "Clicks", count: totalClicks, color: "bg-purple-500" },
      { step: "Add to Cart", count: totalCartAdds, color: "bg-amber-500" },
      { step: "Checkout", count: totalCheckouts, color: "bg-orange-500" },
      { step: "Purchase", count: totalPurchases, color: "bg-green-500" },
    ];

    return NextResponse.json({
      summary: { totalImpressions, totalClicks, totalCartAdds, totalCheckouts, totalPurchases },
      funnel,
      topProducts,
      topCategories,
      dailyFunnel,
      recentEvents,
    });
  } catch (error) {
    console.error("GET /api/analytics/stats error:", error);
    return NextResponse.json({ summary: { totalImpressions: 0, totalClicks: 0, totalCartAdds: 0, totalCheckouts: 0, totalPurchases: 0 }, funnel: [], topProducts: [], topCategories: [], dailyFunnel: [], recentEvents: [] });
  }
}
