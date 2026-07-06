"use client";

import { useState, useEffect } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  productCount?: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: "0",
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?withCount=true");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {}
    setLoading(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", image: "", sortOrder: "0" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      sortOrder: cat.sortOrder?.toString() || "0",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      name: form.name,
      description: form.description,
      image: form.image,
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        fetchCategories();
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        fetchCategories();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400 mt-1">{categories.length} categories total</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Products</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Sort</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🏷️</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-400 line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${(cat.productCount || 0) === 0 ? "text-gray-400" : "text-gray-900"}`}>
                      {cat.productCount || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{cat.sortOrder}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => openEdit(cat)}
                      className="text-gray-400 hover:text-gray-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">No categories yet</div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Electronics"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                {form.name && (
                  <p className="text-xs text-gray-400 mt-1">
                    Slug: {form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Image URL</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  {form.image && (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={form.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
