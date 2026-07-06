"use client";

import { useState, useEffect, useCallback } from "react";

interface ReturnItem {
  product: string;
  title: string;
  quantity: number;
  reason: string;
  condition: string;
}

interface Return {
  _id: string;
  order: { _id: string; total: number } | null;
  customer: { _id: string; name: string; email: string } | null;
  items: ReturnItem[];
  status: string;
  refundAmount: number;
  restockInventory: boolean;
  adminNotes: string;
  rejectionReason?: string;
  requestedAt: string;
  resolvedAt?: string;
}

interface ReturnStats {
  requested: number;
  approved: number;
  rejected: number;
  received: number;
  refunded: number;
  totalRefunded: number;
}

const statusColors: Record<string, string> = {
  requested: "bg-blue-50 text-blue-600",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-50 text-red-600",
  received: "bg-amber-50 text-amber-600",
  refunded: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-400",
};

const statusActions: Record<string, string[]> = {
  requested: ["approve", "reject"],
  approved: ["receive", "cancel"],
  received: ["refund"],
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [stats, setStats] = useState<ReturnStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const [detailReturn, setDetailReturn] = useState<Return | null>(null);
  const [actionModal, setActionModal] = useState<{ ret: Return; action: string } | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/returns?${params.toString()}`);
      const data = await res.json();
      setReturns(data.returns || []);
      setStats(data.stats || null);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const executeAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/returns/${actionModal.ret._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionModal.action, adminNotes: actionNotes }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlash({ type: "success", msg: `Return ${actionModal.action}d successfully` });
        setActionModal(null);
        setActionNotes("");
        fetchReturns();
      } else {
        setFlash({ type: "error", msg: data.error || "Action failed" });
      }
    } catch {
      setFlash({ type: "error", msg: "Action failed" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFlash(null), 3000);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {flash && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${flash.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {flash.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Return Management</h1>
        <p className="text-sm text-gray-400">Handle return requests and process refunds</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Pending", value: stats.requested, color: stats.requested > 0 ? "text-blue-600" : "text-gray-900" },
            { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
            { label: "Received", value: stats.received, color: "text-amber-600" },
            { label: "Refunded", value: stats.refunded, color: "text-gray-600" },
            { label: "Total Refunded", value: `$${(stats.totalRefunded / 100).toFixed(2)}`, color: "text-gray-900" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["all", "requested", "approved", "rejected", "received", "refunded", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All Returns" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Return ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Refund</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Requested</th>
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
              ) : returns.map((ret) => (
                <tr key={ret._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{ret._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{ret.customer?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{ret.customer?.email || ""}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                    {ret.order ? `#${ret.order._id.slice(-8).toUpperCase()}` : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{ret.items.length} item{ret.items.length > 1 ? "s" : ""}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{ret.items.map((i) => i.title).join(", ")}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">${(ret.refundAmount / 100).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${statusColors[ret.status] || "bg-gray-100 text-gray-600"}`}>
                      {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(ret.requestedAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailReturn(ret)}
                        className="text-gray-500 hover:text-gray-900 text-xs font-medium"
                      >
                        View
                      </button>
                      {(statusActions[ret.status] || []).map((action) => (
                        <button
                          key={action}
                          onClick={() => setActionModal({ ret, action })}
                          className={`text-xs font-medium ${
                            action === "approve" ? "text-emerald-600 hover:text-emerald-700" :
                            action === "reject" ? "text-red-600 hover:text-red-700" :
                            action === "receive" ? "text-amber-600 hover:text-amber-700" :
                            action === "refund" ? "text-blue-600 hover:text-blue-700" :
                            "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && returns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No return requests found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {detailReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailReturn(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Return Details</h3>
              <button onClick={() => setDetailReturn(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${statusColors[detailReturn.status]}`}>
                    {detailReturn.status.charAt(0).toUpperCase() + detailReturn.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Refund Amount</p>
                  <p className="font-bold text-gray-900">${(detailReturn.refundAmount / 100).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Customer</p>
                <p className="text-sm text-gray-900">{detailReturn.customer?.name} ({detailReturn.customer?.email})</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Order</p>
                <p className="text-sm text-gray-900">#{detailReturn.order?._id.slice(-8).toUpperCase() || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Items</p>
                {detailReturn.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} &middot; {item.reason} &middot; {item.condition}</p>
                    </div>
                  </div>
                ))}
              </div>

              {detailReturn.adminNotes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Admin Notes</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{detailReturn.adminNotes}</p>
                </div>
              )}

              {detailReturn.rejectionReason && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{detailReturn.rejectionReason}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Requested: {formatDate(detailReturn.requestedAt)}</span>
                {detailReturn.resolvedAt && <span>&middot; Resolved: {formatDate(detailReturn.resolvedAt)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActionModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)} Return
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {actionModal.action === "reject" ? "Provide a reason for rejection" : "Add optional notes"}
            </p>
            {actionModal.action === "reject" && (
              <input
                type="text"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="Rejection reason"
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                  actionModal.action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" :
                  actionModal.action === "reject" ? "bg-red-500 hover:bg-red-600" :
                  actionModal.action === "receive" ? "bg-amber-500 hover:bg-amber-600" :
                  actionModal.action === "refund" ? "bg-blue-500 hover:bg-blue-600" :
                  "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {actionLoading ? "Processing..." : actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
