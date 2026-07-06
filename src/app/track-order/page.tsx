"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrency } from "@/contexts/CurrencyContext";

interface OrderData {
  _id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  items: Array<{ title: string; quantity: number; price: number }>;
}

const statusSteps = [
  { key: "unfulfilled", label: "Order Placed", icon: "📋" },
  { key: "fulfilled", label: "Processing", icon: "⚙️" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

const statusOrder = ["unfulfilled", "fulfilled", "shipped", "delivered"];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    const orderNum = searchParams.get("orderNumber");
    const orderId = id || orderNum;
    if (orderId) {
      setOrderId(orderId);
      const fetchOrder = async () => {
        setLoading(true);
        try {
          let url: string;
          if (orderNum || orderId.toUpperCase().startsWith("ORD-")) {
            url = `/api/orders/track?orderNumber=${encodeURIComponent(orderNum || orderId)}`;
          } else {
            url = `/api/orders/track?id=${orderId}`;
          }
          const res = await fetch(url);
          const data = await res.json();
          if (res.ok) setOrder(data.order);
        } catch {}
        setLoading(false);
      };
      fetchOrder();
    }
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    const trimmed = orderId.trim();
    try {
      let url: string;
      if (trimmed.toUpperCase().startsWith("ORD-")) {
        url = `/api/orders/track?orderNumber=${encodeURIComponent(trimmed)}`;
      } else {
        url = `/api/orders/track?id=${encodeURIComponent(trimmed)}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Failed to look up order");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? statusOrder.indexOf(order.fulfillmentStatus) : -1;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Track Order</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-400 text-sm mb-8">Enter your order ID to see the current status.</p>

        <form onSubmit={handleTrack} className="flex gap-2 mb-10">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter order number (e.g., ORD-20260704-A1B2C3)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Looking..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center mb-8">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Check your order ID and try again</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="p-5 border border-gray-100 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400">Order Number</p>
                  <p className="font-mono text-xs font-medium text-gray-900">{order.orderNumber || order._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Placed on</p>
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, i) => {
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${
                          isCompleted ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-gray-900/10" : ""}`}>
                          {isCompleted && i < currentStepIndex ? "✓" : step.icon}
                        </div>
                        <p className={`text-[11px] font-medium mt-2 text-center ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 -z-0">
                  <div
                    className="h-full bg-gray-900 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border border-gray-100 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}>
                Payment: {order.paymentStatus}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                order.fulfillmentStatus === "delivered" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
              }`}>
                Status: {order.fulfillmentStatus}
              </span>
            </div>
          </div>
        )}

        {!order && !error && (
          <div className="text-center py-16">
            <p className="text-gray-400">Enter your order ID above to track your package</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
