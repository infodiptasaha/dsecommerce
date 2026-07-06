"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  lowStock: number;
  pendingOrders: number;
  pendingReturns: number;
  unpublishedProducts: number;
  outOfStock: number;
}

export default function ActionCenterPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [prods, orders, users, inv] = await Promise.all([
        fetch("/api/products?limit=1").then(r => r.json()),
        fetch("/api/admin/orders").then(r => r.json()),
        fetch("/api/admin/users?limit=1").then(r => r.json()).catch(() => ({ pagination: { total: 0 } })),
        fetch("/api/admin/inventory").then(r => r.json()),
      ]);

      setStats({
        totalProducts: prods.pagination?.total || 0,
        totalOrders: orders.orders?.length || 0,
        totalUsers: users.pagination?.total || 0,
        lowStock: inv.stats?.lowStock || 0,
        pendingOrders: orders.orders?.filter((o: any) => o.fulfillmentStatus === "unfulfilled").length || 0,
        pendingReturns: 0,
        unpublishedProducts: 0,
        outOfStock: inv.stats?.outOfStock || 0,
      });
    } catch {}
    setLoading(false);
  };

  const flash = (msg: string) => {
    setResult(msg);
    setTimeout(() => setResult(""), 3000);
  };

  const bulkPublishAll = async () => {
    if (!confirm("Publish all draft products?")) return;
    setActionLoading("publish");
    try {
      const res = await fetch("/api/products?limit=50&published=false");
      const data = await res.json();
      const drafts = data.products || [];
      let count = 0;
      for (const p of drafts) {
        await fetch(`/api/products/${p._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: true }),
        });
        count++;
      }
      flash(`Published ${count} products`);
      fetchStats();
    } catch { flash("Failed"); }
    setActionLoading("");
  };

  const markAllOrdersPaid = async () => {
    if (!confirm("Mark all pending COD orders as paid?")) return;
    setActionLoading("pay");
    try {
      const res = await fetch("/api/admin/orders?status=unfulfilled");
      const data = await res.json();
      const orders = data.orders || [];
      let count = 0;
      for (const o of orders) {
        if (o.paymentProvider === "cod" && o.paymentStatus === "pending") {
          count++;
        }
      }
      flash(`Found ${count} pending COD orders (payment confirmation requires manual verification)`);
    } catch { flash("Failed"); }
    setActionLoading("");
  };

  const restockLowProducts = async () => {
    if (!confirm("Set stock to 50 for all out-of-stock products?")) return;
    setActionLoading("restock");
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      const products = data.products || [];
      const oos = products.filter((p: any) => p.inventory === 0);
      let count = 0;
      for (const p of oos) {
        await fetch("/api/admin/inventory", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: p._id, inventory: 50 }),
        });
        count++;
      }
      flash(`Restocked ${count} products to 50 units`);
      fetchStats();
    } catch { flash("Failed"); }
    setActionLoading("");
  };

  const bulkDeleteUnpublished = async () => {
    if (!confirm("Delete ALL unpublished/draft products? This cannot be undone.")) return;
    setActionLoading("delete-drafts");
    try {
      const res = await fetch("/api/products?limit=100&published=false");
      const data = await res.json();
      const drafts = data.products || [];
      let count = 0;
      for (const p of drafts) {
        await fetch(`/api/products/${p._id}`, { method: "DELETE" });
        count++;
      }
      flash(`Deleted ${count} draft products`);
      fetchStats();
    } catch { flash("Failed"); }
    setActionLoading("");
  };

  const exportOrders = async () => {
    setActionLoading("export-orders");
    try {
      const res = await fetch("/api/admin/orders?limit=500");
      const data = await res.json();
      const orders = data.orders || [];
      const headers = ["Order ID", "Customer", "Total", "Payment", "Status", "Date"];
      const rows = orders.map((o: any) => [
        o._id, o.customer?.name || "Guest", (o.total / 100).toFixed(2),
        o.paymentProvider, o.fulfillmentStatus, new Date(o.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers, ...rows].map((r) => r.map((c: string | number) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      flash(`Exported ${orders.length} orders`);
    } catch { flash("Export failed"); }
    setActionLoading("");
  };

  const exportProducts = async () => {
    setActionLoading("export-products");
    try {
      const res = await fetch("/api/products?limit=500");
      const data = await res.json();
      const products = data.products || [];
      const headers = ["SKU", "Title", "Price", "Stock", "Category", "Published", "Rating"];
      const rows = products.map((p: any) => [
        p.sku, p.title, (p.price / 100).toFixed(2), p.inventory,
        p.category?.name || "", p.isPublished ? "Yes" : "No", p.averageRating,
      ]);
      const csv = [headers, ...rows].map((r) => r.map((c: string | number) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      flash(`Exported ${products.length} products`);
    } catch { flash("Export failed"); }
    setActionLoading("");
  };

  const ActionCard = ({ title, desc, icon, onClick, loading: isLoading, color = "gray", href }: {
    title: string; desc: string; icon: string; onClick?: () => void; loading?: boolean; color?: string; href?: string;
  }) => {
    const colors: Record<string, string> = {
      gray: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      blue: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      green: "bg-green-50 hover:bg-green-100 border-green-200",
      amber: "bg-amber-50 hover:bg-amber-100 border-amber-200",
      red: "bg-red-50 hover:bg-red-100 border-red-200",
      purple: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    };

    const inner = (
      <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${colors[color]} ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </div>
          {isLoading && <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />}
        </div>
      </div>
    );

    if (href) return <Link href={href}>{inner}</Link>;
    return <div onClick={onClick}>{inner}</div>;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Action Center</h1>
        <p className="text-sm text-gray-400 mt-1">Quick administrative actions and bulk operations</p>
      </div>

      {result && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">{result}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400">Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400">Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
              </div>
            </div>
          )}

          {/* Product Actions */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionCard
                title="Publish All Drafts"
                desc="Make all draft products visible on the storefront"
                icon="📝"
                onClick={bulkPublishAll}
                loading={actionLoading === "publish"}
                color="blue"
              />
              <ActionCard
                title="Restock Out of Stock"
                desc="Set stock to 50 units for all out-of-stock products"
                icon="📦"
                onClick={restockLowProducts}
                loading={actionLoading === "restock"}
                color="green"
              />
              <ActionCard
                title="Delete All Drafts"
                desc="Permanently remove all unpublished products"
                icon="🗑️"
                onClick={bulkDeleteUnpublished}
                loading={actionLoading === "delete-drafts"}
                color="red"
              />
              <ActionCard
                title="Export Products CSV"
                desc="Download full product catalog as spreadsheet"
                icon="📊"
                onClick={exportProducts}
                loading={actionLoading === "export-products"}
                color="purple"
              />
              <ActionCard
                title="Manage Products"
                desc="View, edit, add, or remove products"
                icon="📦"
                href="/admin/products"
                color="gray"
              />
              <ActionCard
                title="Manage Categories"
                desc="Organize products into categories"
                icon="🏷️"
                href="/admin/categories"
                color="gray"
              />
            </div>
          </div>

          {/* Order Actions */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionCard
                title="Review Pending Orders"
                desc="Check and process unfulfilled orders"
                icon="🛒"
                href="/admin/orders?status=unfulfilled"
                color="amber"
              />
              <ActionCard
                title="Check COD Payments"
                desc="Review pending cash-on-delivery orders"
                icon="💵"
                onClick={markAllOrdersPaid}
                loading={actionLoading === "pay"}
                color="green"
              />
              <ActionCard
                title="Export Orders CSV"
                desc="Download order history as spreadsheet"
                icon="📊"
                onClick={exportOrders}
                loading={actionLoading === "export-orders"}
                color="purple"
              />
              <ActionCard
                title="Review Returns"
                desc="Process return and refund requests"
                icon="🔄"
                href="/admin/returns"
                color="gray"
              />
              <ActionCard
                title="View All Orders"
                desc="Browse complete order history"
                icon="📋"
                href="/admin/orders"
                color="gray"
              />
            </div>
          </div>

          {/* Inventory Actions */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionCard
                title="Low Stock Alert"
                desc="View products running low on stock"
                icon="⚠️"
                href="/admin/inventory?filter=low"
                color="amber"
              />
              <ActionCard
                title="Out of Stock"
                desc="View products that need restocking"
                icon="❌"
                href="/admin/inventory?filter=out"
                color="red"
              />
              <ActionCard
                title="Full Inventory"
                desc="Manage stock levels for all products"
                icon="📋"
                href="/admin/inventory"
                color="gray"
              />
            </div>
          </div>

          {/* System */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionCard
                title="Store Settings"
                desc="Configure currency, shipping, and store info"
                icon="⚙️"
                href="/admin/settings"
                color="gray"
              />
              <ActionCard
                title="View Storefront"
                desc="Preview the customer-facing website"
                icon="🌐"
                href="/"
                color="gray"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
