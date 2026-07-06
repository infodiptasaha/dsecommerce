"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

type Tab = "overview" | "orders" | "addresses" | "settings";

interface Order {
  _id: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  items: Array<{ title: string; quantity: number; price: number; image: string }>;
}

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  useEffect(() => {
    if (session) fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/mine");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
    setLoadingOrders(false);
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await update();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "👤" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "addresses", label: "Addresses", icon: "📍" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Account</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-56 flex-shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{session.user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-400">{session.user?.email}</p>
              </div>
            </div>

            <nav className="space-y-0.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    tab === t.id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
              <Link href="/track-order" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <span>🔍</span> Track Order
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left">
                <span>🚪</span> Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {tab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
                  <p className="text-sm text-gray-400">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Orders</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.paymentStatus === "paid").length}</p>
                    <p className="text-xs text-gray-400 mt-1">Paid Orders</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.fulfillmentStatus === "delivered").length}</p>
                    <p className="text-xs text-gray-400 mt-1">Delivered</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/products" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <span className="text-xl">🛍️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Shop Now</p>
                        <p className="text-xs text-gray-400">Browse products</p>
                      </div>
                    </Link>
                    <Link href="/track-order" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <span className="text-xl">📦</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Track Order</p>
                        <p className="text-xs text-gray-400">Check status</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
                {loadingOrders ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 mb-3">No orders yet</p>
                    <Link href="/products" className="text-sm font-medium text-gray-900 hover:underline">Start shopping →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-white border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400">Order #{order._id.slice(-8)}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                              {order.paymentStatus}
                            </span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                              order.fulfillmentStatus === "delivered" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                            }`}>
                              {order.fulfillmentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">Total: {formatPrice(order.total)}</span>
                          <Link href={`/track-order?id=${order._id}`} className="text-xs text-gray-400 hover:text-gray-900">Track →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Addresses</h1>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 border border-dashed border-gray-200 rounded-xl text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <span className="text-2xl block mb-2">➕</span>
                    <p className="text-sm font-medium text-gray-500">Add New Address</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900">Default</span>
                      <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded font-medium">Home</span>
                    </div>
                    <p className="text-sm text-gray-600">123 Main Street</p>
                    <p className="text-sm text-gray-600">New York, NY 10001</p>
                    <p className="text-sm text-gray-600">United States</p>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs text-gray-400 hover:text-gray-900">Edit</button>
                      <button className="text-xs text-gray-400 hover:text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
                  <p className="text-sm text-gray-400">Manage your account preferences</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={session.user?.email || ""} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
                    </div>
                    <button onClick={updateProfile} disabled={saving} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                      {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">Notifications</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Order updates", desc: "Get notified about order status changes", default: true },
                      { label: "Promotions", desc: "Receive deals and special offers", default: true },
                      { label: "New arrivals", desc: "Get notified when new products drop", default: false },
                    ].map((item, i) => (
                      <label key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gray-900/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900"></div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-red-100 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h2>
                  <p className="text-xs text-gray-400 mb-3">Once you delete your account, there is no going back.</p>
                  <button className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
