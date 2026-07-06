"use client";

import { useState, useEffect, useCallback } from "react";
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
  category?: { name: string; slug: string };
  inventory: number;
}

interface Category {
  name: string;
  slug: string;
}

const sortOptions = [
  { value: "-createdAt", label: "Newest First" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-averageRating", label: "Top Rated" },
];

export default function ProductsPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [showOOS, setShowOOS] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((data) => {
      setCategories(data.categories || []);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      params.set("sort", sort);
      if (category !== "all") {
        const cat = categories.find((c) => c.slug === category);
        if (cat) params.set("category", (cat as unknown as { _id: string })._id);
      }
      if (search) params.set("search", search);
      if (showOOS) params.delete("inStock");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, category, categories, search, showOOS]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [category, sort, search, showOOS]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shop</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">All Products</h1>
          <p className="text-sm text-gray-400">{pagination.total} products</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat.slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={showOOS} onChange={(e) => setShowOOS(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
              Out of stock
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer">
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-5 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                      p === page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400">No products found</p>
            <p className="text-sm text-gray-300 mt-1">Try a different category or search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
