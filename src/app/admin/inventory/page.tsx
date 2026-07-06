"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InventoryProduct {
  _id: string;
  title: string;
  sku: string;
  inventory: number;
  price: number;
  isPublished: boolean;
  category?: { name: string; slug: string };
  images: string[];
}

interface InventoryStats {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalInventory: number;
  stockValue: number;
}

interface StockEdit {
  productId: string;
  inventory: number;
}

export default function InventoryPage() {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingChanges, setPendingChanges] = useState<StockEdit[]>([]);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      params.set("filter", filter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setStats(data.stats || null);
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const startEdit = (product: InventoryProduct) => {
    setEditingId(product._id);
    setEditValue(String(product.inventory));
  };

  const saveEdit = (productId: string) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) return;
    setPendingChanges((prev) => {
      const existing = prev.findIndex((c) => c.productId === productId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].inventory = val;
        return updated;
      }
      return [...prev, { productId, inventory: val }];
    });
    setProducts((prev) => prev.map((p) => p._id === productId ? { ...p, inventory: val } : p));
    setEditingId(null);
  };

  const saveAll = async () => {
    if (pendingChanges.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: pendingChanges }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlash({ type: "success", msg: data.message });
        setPendingChanges([]);
        fetchInventory();
      } else {
        setFlash({ type: "error", msg: data.error || "Failed to save" });
      }
    } catch {
      setFlash({ type: "error", msg: "Failed to save" });
    } finally {
      setSaving(false);
      setTimeout(() => setFlash(null), 3000);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p._id)));
    }
  };

  const applyBulk = () => {
    const val = parseInt(bulkValue, 10);
    if (isNaN(val) || val < 0) return;
    const updates: StockEdit[] = Array.from(selected).map((id) => ({ productId: id, inventory: val }));
    setPendingChanges((prev) => {
      const map = new Map(prev.map((c) => [c.productId, c]));
      updates.forEach((u) => map.set(u.productId, u));
      return Array.from(map.values());
    });
    setProducts((prev) => prev.map((p) => selected.has(p._id) ? { ...p, inventory: val } : p));
    setShowBulk(false);
    setBulkValue("");
    setSelected(new Set());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {flash && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${flash.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {flash.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory Management</h1>
        <p className="text-sm text-gray-400">Track and manage product stock levels</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats.totalProducts, color: "text-gray-900" },
            { label: "Total Stock", value: stats.totalInventory.toLocaleString(), color: "text-gray-900" },
            { label: "Stock Value", value: `$${(stats.stockValue / 100).toLocaleString()}`, color: "text-gray-900" },
            { label: "Low Stock", value: stats.lowStock, color: stats.lowStock > 0 ? "text-amber-600" : "text-gray-900" },
            { label: "Out of Stock", value: stats.outOfStock, color: stats.outOfStock > 0 ? "text-red-600" : "text-gray-900" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "All Products" : f === "low" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={() => setShowBulk(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Bulk Set ({selected.size})
            </button>
          )}
          {pendingChanges.length > 0 && (
            <button
              onClick={saveAll}
              disabled={saving}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : `Save ${pendingChanges.length} Change${pendingChanges.length > 1 ? "s" : ""}`}
            </button>
          )}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>
      </div>

      {/* Bulk Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBulk(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Set Stock</h3>
            <p className="text-sm text-gray-400 mb-4">Set inventory for {selected.size} selected products</p>
            <input
              type="number"
              min="0"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="New stock value"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowBulk(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={applyBulk} className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selected.size === products.length && products.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={8} className="py-4 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.map((product) => {
                const isPending = pendingChanges.some((c) => c.productId === product._id);
                const stockColor = product.inventory === 0 ? "text-red-600 font-bold" : product.inventory <= 5 ? "text-amber-600 font-semibold" : "text-gray-900";
                return (
                  <tr key={product._id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${isPending ? "bg-amber-50/30" : ""}`}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="py-3 px-4 text-gray-500">{product.category?.name || "—"}</td>
                    <td className="py-3 px-4 text-gray-900">{formatPrice(product.price)}</td>
                    <td className="py-3 px-4">
                      {editingId === product._id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(product._id); if (e.key === "Escape") setEditingId(null); }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(product._id)} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">Save</button>
                        </div>
                      ) : (
                        <span className={stockColor}>{product.inventory}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.inventory === 0 ? "bg-red-50 text-red-600" :
                        product.inventory <= 5 ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {product.inventory === 0 ? "Out of Stock" : product.inventory <= 5 ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => startEdit(product)}
                        className="text-gray-500 hover:text-gray-900 text-xs font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {pagination.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
