"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/action-center", label: "Action Center", icon: "⚡" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/inventory", label: "Inventory", icon: "📋" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/returns", label: "Returns", icon: "🔄" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const visibleNav = navItems.filter((item) => {
    if (item.href === "/admin/users" && !isAdmin) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-gray-900">SHOP<span className="text-gray-400">HUB</span></span>
          </Link>
          <p className="text-[11px] text-gray-400 mt-1.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {visibleNav.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{session?.user?.name?.charAt(0) || "A"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <Link href="/" className="flex-1 text-center py-1.5 text-[11px] text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View Site</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="flex-1 py-1.5 text-[11px] text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
