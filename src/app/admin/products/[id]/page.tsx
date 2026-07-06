"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { _id: string; name: string; slug: string };
  tags: string[];
  sku: string;
  inventory: number;
  isPublished: boolean;
  averageRating: number;
  numReviews: number;
  weight?: number;
  createdAt?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    inventory: "",
    category: "",
    tags: "",
    image: "",
    isPublished: true,
    weight: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([productData, categoryData]) => {
      if (productData.product) {
        const p = productData.product;
        setProduct(p);
        setForm({
          title: p.title || "",
          description: p.description || "",
          price: (p.price / 100).toString(),
          compareAtPrice: p.compareAtPrice ? (p.compareAtPrice / 100).toString() : "",
          sku: p.sku || "",
          inventory: p.inventory?.toString() || "",
          category: p.category?._id || "",
          tags: (p.tags || []).join(", "),
          image: p.images?.[0] || "",
          isPublished: p.isPublished ?? true,
          weight: p.weight?.toString() || "",
        });
      }
      setCategories(categoryData.categories || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load product");
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Record<string, any> = {
        title: form.title,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        compareAtPrice: form.compareAtPrice ? Math.round(parseFloat(form.compareAtPrice) * 100) : undefined,
        sku: form.sku,
        inventory: parseInt(form.inventory),
        category: form.category,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        images: form.image ? [form.image] : product?.images || [],
        isPublished: form.isPublished,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Refresh product data
        const data = await res.json();
        if (data.product) setProduct(data.product);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Product not found</p>
          <Link href="/admin/products" className="text-sm text-gray-900 font-medium hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-gray-900">Admin</Link>
        <span>/</span>
        <Link href="/admin/products" className="hover:text-gray-900">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.title}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-400 mt-1">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Live ↗
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                  <textarea
                    rows={5}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g. keyboard, mechanical, gaming"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Product Image</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {form.image ? (
                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Image URL"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Paste an image URL. Leave empty to keep current image.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Status</h2>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  form.isPublished
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                <span>{form.isPublished ? "Published" : "Draft"}</span>
                <div className={`w-10 h-5 rounded-full transition-colors ${form.isPublished ? "bg-green-500" : "bg-gray-300"} relative`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </button>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  {form.price && (
                    <p className="text-xs text-gray-400 mt-1">Displays as {formatPrice(Math.round(parseFloat(form.price) * 100))}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Compare at Price (৳, optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    placeholder="Original price for sale badge"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Inventory</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">SKU</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={form.inventory}
                    onChange={(e) => setForm({ ...form, inventory: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Weight (kg, optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Category</h2>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="font-medium">{product.averageRating?.toFixed(1)} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reviews</span>
                  <span className="font-medium">{product.numReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="font-medium">{new Date(product.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
