import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "-createdAt";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const published = searchParams.get("published");

    if (slug) {
      const product = await Product.findOne({ slug }).populate("category", "name slug");
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json({ product });
    }

    const filter: Record<string, unknown> = {};

    if (published !== "false") {
      filter.isPublished = true;
    }

    if (category) {
      filter["category"] = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice, 10);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice, 10);
      filter.price = priceFilter;
    }

    if (inStock === "true") {
      filter.inventory = { $gt: 0 };
    }

    const sortObj: Record<string, 1 | -1> = {};
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDir = sort.startsWith("-") ? -1 : 1;
    sortObj[sortField] = sortDir;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();

    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const product = await Product.create({
      ...body,
      slug,
      isPublished: body.isPublished ?? true,
    });

    return NextResponse.json({ message: "Product created", product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
