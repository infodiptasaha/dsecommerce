import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const product = await Product.findById(id).populate("category", "name slug");
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ message: "Product updated", product });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
