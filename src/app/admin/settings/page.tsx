"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AdminSettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const [settings, setSettings] = useState({
    storeName: "ShopHub",
    storeEmail: "support@shophub.com",
    currency: currency,
    taxRate: "8",
    freeShippingThreshold: "5000",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
    if (settings.currency !== currency) setCurrency(settings.currency as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure your store settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Store Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" value={settings.storeEmail} onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Pricing & Shipping</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
              <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value as any })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="space-y-3">
            {[
              { label: "Order confirmation emails", desc: "Send email when order is placed", default: true },
              { label: "Shipping updates", desc: "Notify customers when order ships", default: true },
              { label: "Low stock alerts", desc: "Alert when inventory is below 5", default: true },
              { label: "New user registration", desc: "Notify admin on new signup", default: false },
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

        <button onClick={handleSave} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
