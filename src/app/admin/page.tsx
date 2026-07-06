"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalCartAdds: number;
  totalCheckouts: number;
  totalPurchases: number;
}

interface DashboardData {
  stats: { totalOrders: number; totalRevenue: number; totalProducts: number; totalUsers: number; recentOrders: any[] };
  analytics: {
    summary: AnalyticsSummary;
    funnel: { step: string; count: number; color: string }[];
    topProducts: { _id: string; title: string; clicks: number }[];
    topCategories: { _id: string; total: number; impressions: number; clicks: number; carts: number }[];
    recentEvents: any[];
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => { fetchData(); }, [days]);

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/analytics/stats?days=${days}`),
      ]);
      const stats = await statsRes.json();
      const analytics = await analyticsRes.json();
      setData({ stats, analytics });
    } catch {}
    setLoading(false);
  };

  const maxFunnel = data ? Math.max(...data.analytics.funnel.map(f => f.count), 1) : 1;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-1.5">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                days === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue", value: `$${((data?.stats.totalRevenue ?? 0) / 100).toFixed(0)}`, icon: "💰", bg: "bg-green-50" },
          { label: "Orders", value: data?.stats.totalOrders ?? 0, icon: "🛒", bg: "bg-blue-50" },
          { label: "Products", value: data?.stats.totalProducts ?? 0, icon: "📦", bg: "bg-purple-50" },
          { label: "Users", value: data?.stats.totalUsers ?? 0, icon: "👥", bg: "bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4`}>
            <span className="text-lg">{s.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Impressions", value: data?.analytics.summary.totalImpressions ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Clicks", value: data?.analytics.summary.totalClicks ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Add to Cart", value: data?.analytics.summary.totalCartAdds ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Checkouts", value: data?.analytics.summary.totalCheckouts ?? 0, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Purchases", value: data?.analytics.summary.totalPurchases ?? 0, color: "text-green-600", bg: "bg-green-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {data?.analytics.funnel.map((step, i) => {
              const pct = maxFunnel > 0 ? (step.count / maxFunnel) * 100 : 0;
              const convRate = i > 0 && data?.analytics.funnel[i - 1]?.count > 0
                ? ((step.count / data.analytics.funnel[i - 1].count) * 100).toFixed(1)
                : "100";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{step.count}</span>
                      {i > 0 && <span className="text-[10px] text-gray-400">({convRate}%)</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${step.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Clicked Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Most Clicked Products</h2>
          {(data?.analytics.topProducts ?? []).length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">No click data yet</div>
          ) : (
            <div className="space-y-2">
              {data?.analytics.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                    <span className="text-sm text-gray-900 line-clamp-1">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(p.clicks / (data?.analytics.topProducts[0]?.clicks || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 w-8 text-right">{p.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Categories */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Popular Categories</h2>
        {(data?.analytics.topCategories ?? []).length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No category data yet</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {data?.analytics.topCategories.map((cat, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-900 capitalize mb-2">{cat._id?.replace("-", " ") || "N/A"}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Views</span>
                    <span className="font-medium text-blue-600">{cat.impressions}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Clicks</span>
                    <span className="font-medium text-purple-600">{cat.clicks}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Carts</span>
                    <span className="font-medium text-amber-600">{cat.carts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Live Activity Feed</h2>
        {(data?.analytics.recentEvents ?? []).length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No activity yet — events will appear as users browse</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data?.analytics.recentEvents.map((ev, i) => {
              const eventIcons: Record<string, string> = {
                impression: "👁️", click: "🖱️", add_to_cart: "🛒", checkout: "💳", purchase: "✅",
              };
              const eventColors: Record<string, string> = {
                impression: "bg-blue-50 text-blue-700",
                click: "bg-purple-50 text-purple-700",
                add_to_cart: "bg-amber-50 text-amber-700",
                checkout: "bg-orange-50 text-orange-700",
                purchase: "bg-green-50 text-green-700",
              };
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-base">{eventIcons[ev.event] || "📊"}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${eventColors[ev.event] || "bg-gray-100 text-gray-500"}`}>
                    {ev.event.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-600 flex-1 line-clamp-1">
                    {ev.productTitle || ev.metadata?.orderId || "General event"}
                  </span>
                  <span className="text-[10px] text-gray-400">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/admin/products", label: "Products", icon: "📦" },
          { href: "/admin/orders", label: "Orders", icon: "🛒" },
          { href: "/admin/users", label: "Users", icon: "👥" },
          { href: "/admin/settings", label: "Settings", icon: "⚙️" },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
