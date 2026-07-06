"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  customer?: { name: string; email: string };
  items: Array<{ title: string; quantity: number; price: number; sku?: string }>;
  paymentProvider: string;
  shippingAddress?: { fullName: string; address: string; city: string; postalCode: string; country: string };
  notes?: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
}

const statusColors: Record<string, string> = {
  unfulfilled: "bg-gray-100 text-gray-600",
  partial: "bg-amber-50 text-amber-700",
  fulfilled: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  returned: "bg-red-50 text-red-700",
};

const paymentColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
  partially_refunded: "bg-orange-50 text-orange-700",
};

const fulfillmentSteps = ["unfulfilled", "fulfilled", "shipped", "delivered"];

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, fulfillmentStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus }),
      });
      if (res.ok) {
        setFlash({ type: "success", msg: `Order marked as ${fulfillmentStatus}` });
        fetchOrders();
        setSelectedOrder(null);
      } else {
        setFlash({ type: "error", msg: "Failed to update status" });
      }
    } catch {
      setFlash({ type: "error", msg: "Failed to update status" });
    }
    setTimeout(() => setFlash(null), 3000);
  };

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.fulfillmentStatus === statusFilter);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {flash && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${flash.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {flash.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} orders total</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["all", "unfulfilled", "partial", "fulfilled", "shipped", "delivered", "returned"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Order ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Items</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Payment</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-900">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <p className="text-gray-900">{order.customer?.name || "Guest"}</p>
                      <p className="text-xs text-gray-400">{order.customer?.email || ""}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{order.items?.length || 0}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">${(order.total / 100).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-500 capitalize">{order.paymentProvider}</span>
                      <span className={`ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${paymentColors[order.paymentStatus] || "bg-gray-100 text-gray-500"}`}>
                        {order.paymentStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${statusColors[order.fulfillmentStatus] || "bg-gray-100 text-gray-500"}`}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelectedOrder(order)} className="text-xs text-gray-400 hover:text-gray-900 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Payment */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Customer</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.customer?.name || "Guest"}</p>
                  <p className="text-xs text-gray-400">{selectedOrder.customer?.email || ""}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Payment</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedOrder.paymentProvider}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${paymentColors[selectedOrder.paymentStatus]}`}>
                    {selectedOrder.paymentStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Shipping Address</p>
                  <div className="text-sm text-gray-900">
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Items</p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className={`flex justify-between items-center py-3 px-4 text-sm ${i > 0 ? "border-t border-gray-50" : ""}`}>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}{item.sku ? ` · SKU: ${item.sku}` : ""}</p>
                      </div>
                      <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  {selectedOrder.subtotal != null && (
                    <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-gray-900">${(selectedOrder.subtotal / 100).toFixed(2)}</span></div>
                  )}
                  {selectedOrder.tax != null && (
                    <div className="flex justify-between"><span className="text-gray-400">Tax</span><span className="text-gray-900">${(selectedOrder.tax / 100).toFixed(2)}</span></div>
                  )}
                  {selectedOrder.shippingCost != null && (
                    <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-gray-900">${(selectedOrder.shippingCost / 100).toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold border-t border-gray-100 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${(selectedOrder.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Timeline */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-3">Fulfillment Status</p>
                <div className="flex items-center gap-1">
                  {fulfillmentSteps.map((step, i) => {
                    const currentIndex = fulfillmentSteps.indexOf(selectedOrder.fulfillmentStatus);
                    const isActive = i <= currentIndex;
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`w-full h-2 rounded-full ${isActive ? "bg-gray-900" : "bg-gray-100"}`} />
                        {i < fulfillmentSteps.length - 1 && <div className={`w-1 h-2 ${isActive ? "bg-gray-900" : "bg-gray-100"}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {fulfillmentSteps.map((step) => (
                    <span key={step} className="text-[10px] text-gray-400 capitalize">{step}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {fulfillmentSteps.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder._id, status)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedOrder.fulfillmentStatus === status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
