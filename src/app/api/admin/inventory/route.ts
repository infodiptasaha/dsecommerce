import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "low" | "out" | "all"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (filter === "low") {
      query.inventory = { $gt: 0, $lte: 10 };
      query.isPublished = true;
    } else if (filter === "out") {
      query.inventory = 0;
    } else if (filter === "all") {
      // no inventory filter
    } else {
      // default: show published only
      query.isPublished = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .select("title sku inventory price isPublished category images")
        .populate("category", "name slug")
        .sort({ inventory: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const stats = await Product.aggregate([
      {
        $facet: {
          totalProducts: [{ $count: "count" }],
          outOfStock: [{ $match: { inventory: 0 } }, { $count: "count" }],
          lowStock: [
            { $match: { inventory: { $gt: 0, $lte: 10 }, isPublished: true } },
            { $count: "count" },
          ],
          totalInventory: [
            { $group: { _id: null, total: { $sum: "$inventory" } } },
          ],
          stockValue: [
            { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$inventory"] } } } },
          ],
        },
      },
    ]);

    return NextResponse.json({
      products,
      stats: {
        totalProducts: stats[0].totalProducts[0]?.count || 0,
        outOfStock: stats[0].outOfStock[0]?.count || 0,
        lowStock: stats[0].lowStock[0]?.count || 0,
        totalInventory: stats[0].totalInventory[0]?.total || 0,
        stockValue: stats[0].stockValue[0]?.total || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Single product stock update
    if (body.productId && typeof body.inventory === "number") {
      const product = await Product.findByIdAndUpdate(
        body.productId,
        { inventory: Math.max(0, body.inventory) },
        { new: true }
      );
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json({ message: "Stock updated", product });
    }

    // Bulk stock update
    if (body.updates && Array.isArray(body.updates)) {
      const ops = body.updates.map((u: { productId: string; inventory: number }) => ({
        updateOne: {
          filter: { _id: u.productId },
          update: { inventory: Math.max(0, u.inventory) },
        },
      }));
      const result = await Product.bulkWrite(ops);
      return NextResponse.json({ message: `${result.modifiedCount} products updated`, modifiedCount: result.modifiedCount });
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/admin/inventory error:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
