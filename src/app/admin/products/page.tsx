"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  isPublished: boolean;
  category: { name: string; slug: string };
  images: string[];
}

export default function AdminProductsPage() {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", price: "", inventory: "", category: "electronics", description: "", image: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=50");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          price: Math.round(parseFloat(form.price) * 100),
          inventory: parseInt(form.inventory),
          category: form.category,
          description: form.description,
          images: [form.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"],
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm({ title: "", price: "", inventory: "", category: "electronics", description: "", image: "" });
        fetchProducts();
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {}
  };

  const togglePublish = async (product: Product) => {
    try {
      await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });
      fetchProducts();
    } catch {}
  };

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} products total</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
          + Add Product
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Price</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{product.category?.name || "N/A"}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${product.inventory === 0 ? "text-red-500" : product.inventory < 5 ? "text-amber-500" : "text-gray-900"}`}>
                      {product.inventory}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => togglePublish(product)} className={`px-2 py-0.5 rounded text-[11px] font-medium ${product.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {product.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/products/${product._id}`} className="text-gray-400 hover:text-gray-900 mr-3">Edit</Link>
                    <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No products found</div>}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Product</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="text" placeholder="Product title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" placeholder="Price ($)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                <input type="number" placeholder="Stock" required value={form.inventory} onChange={(e) => setForm({ ...form, inventory: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="sports">Sports</option>
                <option value="accessories">Accessories</option>
                <option value="home-living">Home & Living</option>
              </select>
              <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
              <input type="text" placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">{saving ? "Adding..." : "Add Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
