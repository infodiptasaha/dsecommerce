import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    if (body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    const category = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ message: "Category updated", category });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} products use this category` },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
