import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Return from "@/models/Return";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [returns, total] = await Promise.all([
      Return.find(filter)
        .populate("order", "orderId total")
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Return.countDocuments(filter),
    ]);

    const stats = await Return.aggregate([
      {
        $facet: {
          requested: [{ $match: { status: "requested" } }, { $count: "count" }],
          approved: [{ $match: { status: "approved" } }, { $count: "count" }],
          rejected: [{ $match: { status: "rejected" } }, { $count: "count" }],
          received: [{ $match: { status: "received" } }, { $count: "count" }],
          refunded: [{ $match: { status: "refunded" } }, { $count: "count" }],
          totalRefunded: [
            { $match: { status: "refunded" } },
            { $group: { _id: null, total: { $sum: "$refundAmount" } } },
          ],
        },
      },
    ]);

    return NextResponse.json({
      returns,
      stats: {
        requested: stats[0].requested[0]?.count || 0,
        approved: stats[0].approved[0]?.count || 0,
        rejected: stats[0].rejected[0]?.count || 0,
        received: stats[0].received[0]?.count || 0,
        refunded: stats[0].refunded[0]?.count || 0,
        totalRefunded: stats[0].totalRefunded[0]?.total || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/returns error:", error);
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const returnDoc = await Return.create({
      order: body.orderId,
      customer: body.customerId,
      items: body.items,
      refundAmount: body.refundAmount,
      restockInventory: body.restockInventory ?? true,
      status: "requested",
    });

    return NextResponse.json({ message: "Return request created", return: returnDoc }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/returns error:", error);
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 });
  }
}
