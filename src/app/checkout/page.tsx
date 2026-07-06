"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const subtotal = cartTotal;
  const shipping = subtotal > 500000 ? 0 : 9990;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.city || !form.zip || !form.phone) {
      setError("Please fill in all shipping fields");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          userId: (session?.user as any)?.id || null,
          paymentProvider: paymentMethod,
          shippingAddress: {
            fullName: `${form.firstName} ${form.lastName}`,
            address: form.address,
            city: form.city,
            state: form.state,
            postalCode: form.zip,
            country: "US",
            phone: form.phone,
            email: form.email,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order");
        setLoading(false);
        return;
      }

      // Redirect to payment provider or success page
      if (data.url) {
        window.location.href = data.url;
      } else {
        clearCart();
        router.push(`/order/success?provider=${paymentMethod}&order_id=${data.orderId}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all";
  const labelClass = "text-xs font-medium text-gray-700 mb-1 block";

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-400 mb-6">Add some products before checking out.</p>
          <Link href="/products" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
          <span>/</span>
          <a href="/cart" className="hover:text-gray-900 transition-colors">Cart</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="p-5 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <h2 className="text-sm font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main Street" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="New York" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="NY" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ZIP Code</label>
                  <input type="text" value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="10001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="p-5 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-sm font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-2">
                {[
                  { id: "stripe", label: "Credit / Debit Card", icon: "\u{1F4B3}", desc: "Visa, Mastercard, AMEX" },
                  { id: "paypal", label: "PayPal", icon: "\u{1F3E5}", desc: "Pay with your PayPal account" },
                  { id: "cod", label: "Cash on Delivery", icon: "\u{1F4B5}", desc: "Pay when you receive your order" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{method.label}</p>
                      <p className="text-xs text-gray-400">{method.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentMethod === method.id ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile order summary */}
            <div className="lg:hidden p-5 border border-gray-100 rounded-xl">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h2>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Shipping</span><span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors lg:hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Place Order — $${(total / 100).toFixed(2)}`}
            </button>
          </div>

          {/* Desktop order summary */}
          <div className="hidden lg:block">
            <div className="bg-gray-50 rounded-xl p-5 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Shipping</span><span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Place Order — ${formatPrice(total)}`}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
