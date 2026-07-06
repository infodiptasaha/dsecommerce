"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = cartTotal;
  const shipping = subtotal > 500000 ? 0 : 9990;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Cart</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 mb-1">Your cart is empty</p>
            <p className="text-sm text-gray-300 mb-6">Looks like you haven&apos;t added anything yet.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Start Shopping
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <Link href={`/products/${item.slug}`} className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/products/${item.slug}`} className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">{item.title}</Link>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-red-500 font-medium">Save {Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)}%</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors mt-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Continue Shopping
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 h-fit sticky top-24">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : ""}`}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax (8%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium text-center hover:bg-gray-800 transition-colors">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
