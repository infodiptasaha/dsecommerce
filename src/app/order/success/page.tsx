"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  paymentStatus: string;
  paymentProvider: string;
  fulfillmentStatus: string;
  createdAt: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const provider = searchParams.get("provider");

  useEffect(() => {
    clearCart();

    const fetchOrder = async () => {
      try {
        let url = "";
        if (orderId) {
          url = `/api/orders/track?orderId=${orderId}`;
        } else if (sessionId) {
          url = `/api/orders/track?sessionId=${sessionId}`;
        }

        if (url) {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setOrder(data.order);
          }
        }
      } catch {}
      setLoading(false);
    };

    fetchOrder();
  }, [sessionId, orderId, clearCart]);

  const paymentLabel: Record<string, string> = {
    stripe: "Credit Card",
    paypal: "PayPal",
    cod: "Cash on Delivery",
  };

  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="animate-scale-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-500/10">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
      <p className="text-gray-600 mb-1">Thank you for your purchase.</p>
      <p className="text-gray-400 text-sm mb-8">
        {order ? `Order #${order.orderNumber}` : "Order placed"} — We&apos;ll email you tracking info soon.
      </p>

      {loading ? (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
          </div>
        </div>
      ) : order ? (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>

          {order.items.length > 0 && (
            <div className="mb-4 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600 capitalize">{order.fulfillmentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium">{paymentLabel[order.paymentProvider] || order.paymentProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Delivery</span>
              <span className="font-medium">
                {deliveryStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {deliveryEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium">{paymentLabel[provider || ""] || provider || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Delivery</span>
              <span className="font-medium">
                {deliveryStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {deliveryEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
        {order && (
          <Link href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            Track Order
          </Link>
        )}
        <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
