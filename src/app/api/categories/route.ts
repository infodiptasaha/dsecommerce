import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const withCount = searchParams.get("withCount") === "true";

    if (withCount) {
      const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();

      const counts = await Product.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      counts.forEach((c) => countMap.set(String(c._id), c.count));

      const enriched = categories.map((cat) => ({
        ...cat,
        productCount: countMap.get(String(cat._id)) || 0,
      }));

      return NextResponse.json({ categories: enriched });
    }

    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const existing = await Category.findOne({ $or: [{ slug }, { name: body.name }] });
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    const category = await Category.create({
      name: body.name,
      slug,
      description: body.description || "",
      image: body.image || "",
      sortOrder: body.sortOrder ?? 0,
    });

    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
