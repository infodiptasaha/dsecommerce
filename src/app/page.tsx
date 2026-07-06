"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  averageRating: number;
  numReviews: number;
  inventory: number;
  category?: { name: string; slug: string };
}

interface Category {
  name: string;
  slug: string;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [heroVisible, setHeroVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ name: "All", slug: "all" }]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { setHeroVisible(true); }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=16&inStock=true").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([productData, categoryData]) => {
      setProducts(productData.products || []);
      setTotalCount(productData.pagination?.total || 0);
      const cats = (categoryData.categories || []).map((c: { name: string; slug: string }) => ({ name: c.name, slug: c.slug }));
      setCategories([{ name: "All", slug: "all" }, ...cats]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === "all" || p.category?.slug === activeCategory;
    return matchCategory;
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.03)_0%,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-gray-300 mb-6 border border-white/10">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                New Collection 2026
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
                Discover Your
                <br />
                <span className="gradient-text-white">Perfect Style</span>
              </h1>
              <p className="text-gray-400 mb-10 max-w-md text-lg leading-relaxed">
                Explore our curated collection of premium products. Quality meets affordability with free shipping worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-gray-950 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 text-sm shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/15 hover:-translate-y-0.5">
                  Shop Collection
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/products?sort=-createdAt" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-medium rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm backdrop-blur-sm">
                  New Arrivals
                </Link>
              </div>
            </div>

            <div className={`hidden lg:grid grid-cols-2 gap-5 transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="space-y-5">
                <div className="aspect-[4/5] bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop" alt="Shopping" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" />
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" alt="Watch" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" />
                </div>
              </div>
              <div className="space-y-5 pt-10">
                <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" alt="Headphones" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" />
                </div>
                <div className="aspect-[4/5] bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop" alt="Shoes" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border border-gray-600 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", title: "Free Shipping", desc: "On orders over $50" },
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Secure Payment", desc: "256-bit SSL encryption" },
              { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Easy Returns", desc: "30-day return policy" },
              { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", title: "24/7 Support", desc: "Always here to help" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Featured Products</h2>
            <p className="text-sm text-gray-400">{totalCount > 0 ? `${totalCount} products available` : "Handpicked just for you"}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap bg-gray-100 p-1 rounded-2xl">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeCategory === cat.slug
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-5 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))
          ) : (
            filteredProducts.map((product, i) => (
              <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-gray-400 font-medium">No products in this category</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products" className="inline-flex items-center gap-2.5 px-8 py-4 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 text-sm shadow-sm hover:shadow-lg hover:shadow-gray-900/10 hover:-translate-y-0.5">
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-gray-950 rounded-3xl px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,transparent_50%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-6 border border-white/10">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Limited Time Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Up to 40% Off</h2>
            <p className="text-gray-400 text-base max-w-md">Don&apos;t miss out on our biggest sale of the season. Premium products at unbeatable prices.</p>
          </div>
          <Link href="/products" className="relative inline-flex items-center gap-2.5 px-8 py-4 bg-white text-gray-950 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 text-sm whitespace-nowrap shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/15 hover:-translate-y-0.5">
            Shop the Sale
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-t border-gray-100 bg-white py-5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-8 mx-4">
              {["FREE SHIPPING", "EASY RETURNS", "SECURE PAYMENT", "24/7 SUPPORT", "NEW ARRIVALS", "PREMIUM QUALITY"].map((item, i) => (
                <span key={i} className="flex items-center gap-3 text-xs font-semibold text-gray-300 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
