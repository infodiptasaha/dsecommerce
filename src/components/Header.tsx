"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:block">
              SHOP<span className="text-gray-400">HUB</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Shop" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="relative px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl transition-colors group">
                {item.label}
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gray-900 rounded-full group-hover:w-4 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <div className={`relative w-full transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none transition-all duration-300 ${
                  searchFocused ? "bg-white ring-2 ring-gray-200 shadow-sm" : "hover:bg-gray-100"
                }`}
              />
              <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1.5">
            <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">{cartCount > 0 ? cartCount : 0}</span>
            </Link>

            {session ? (
              <Link href="/account" className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  <span className="text-white text-xs font-bold">{session.user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </div>
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:flex px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${mobileOpen ? "border-t border-gray-100 max-h-80" : "max-h-0"}`}>
        <div className="px-4 py-4 space-y-1 bg-white/80 backdrop-blur-xl">
          <div className="relative mb-3">
            <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200" />
            <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {[
            { href: "/", label: "Home" },
            { href: "/products", label: "Shop" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="block py-2.5 px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href={session ? "/account" : "/login"} className="block py-2.5 px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
            {session ? "Account" : "Sign In"}
          </Link>
        </div>
      </div>
    </header>
  );
}
