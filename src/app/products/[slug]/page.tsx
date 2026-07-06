"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAnalytics } from "@/lib/analytics";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: { name: string; slug: string };
  sku: string;
  inventory: number;
  averageRating: number;
  numReviews: number;
  tags: string[];
}

const fallbackProduct: Product = {
  _id: "",
  title: "",
  slug: "",
  description: "",
  price: 0,
  images: [],
  category: undefined,
  sku: "",
  inventory: 0,
  averageRating: 0,
  numReviews: 0,
  tags: [],
};

const reviews = [
  { name: "Alex K.", rating: 5, date: "2 weeks ago", comment: "Best headphones I've ever owned. The noise cancellation is incredible for the price point.", helpful: 24, avatar: "\u{1F468}" },
  { name: "Maria S.", rating: 4, date: "1 month ago", comment: "Great sound quality and comfortable to wear for long periods. Battery life is as advertised.", helpful: 18, avatar: "\u{1F469}" },
  { name: "Tom B.", rating: 5, date: "3 weeks ago", comment: "Worth every penny. Battery lasts forever and the build quality is premium.", helpful: 31, avatar: "\u{1F468}\u{1F9B1}" },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product>(fallbackProduct);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [selectedImage, setSelectedImage] = useState(0);
  const { trackImpression, trackAddToCart } = useAnalytics();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products?slug=${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product._id) {
      trackImpression(product);
    }
  }, [product._id, trackImpression]);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-64 mb-8" />
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <div className="aspect-square bg-gray-100 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-100 rounded w-24" />
                <div className="h-8 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-10 bg-gray-100 rounded w-32" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product._id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <p className="text-gray-400 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-gray-50 rounded-xl border-2 overflow-hidden transition-all ${
                      i === selectedImage ? "border-gray-900" : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.category && <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">{product.category.name}</span>}
              {discount > 0 && <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded">Save {discount}%</span>}
              {product.inventory === 0 && <span className="px-2.5 py-1 bg-gray-900/10 text-gray-600 text-xs font-medium rounded">Out of Stock</span>}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.averageRating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.averageRating}</span>
              <span className="text-sm text-gray-300">|</span>
              <span className="text-sm text-gray-400">{product.numReviews} reviews</span>
            </div>

            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-900 mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <span className="text-sm text-gray-400">{product.inventory} available</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  addItem({
                    productId: product._id,
                    title: product.title,
                    slug: product.slug,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: product.images[0] || "",
                    inventory: product.inventory,
                    quantity,
                  });
                  trackAddToCart(product, quantity);
                }}
                disabled={product.inventory === 0}
                className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                onClick={() => {
                  addItem({
                    productId: product._id,
                    title: product.title,
                    slug: product.slug,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: product.images[0] || "",
                    inventory: product.inventory,
                    quantity,
                  });
                  trackAddToCart(product, quantity);
                  router.push("/checkout");
                }}
                disabled={product.inventory === 0}
                className="flex-1 border border-gray-900 text-gray-900 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Trust */}
            <div className="space-y-2.5">
              {[
                { icon: "\u{1F69A}", text: "Free shipping on orders over ৳5,000" },
                { icon: "\u{21A9}\u{FE0F}", text: "30-day easy returns & exchanges" },
                { icon: "\u{1F6E1}\u{FE0F}", text: "1-year manufacturer warranty" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs text-gray-500">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-6 border-b border-gray-100 mb-8">
            {[
              { id: "description" as const, label: "Description" },
              { id: "specs" as const, label: "Specifications" },
              { id: "reviews" as const, label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                  activeTab === tab.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="max-w-2xl">
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-2xl">
              {[
                ["SKU", product.sku],
                ["Category", product.category?.name || "N/A"],
                ["In Stock", product.inventory > 0 ? `${product.inventory} units` : "Out of Stock"],
                ...product.tags.map((tag) => ["Tag", tag] as [string, string]),
              ].map(([label, value]) => (
                <div key={`${label}-${value}`} className="flex justify-between py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-2xl space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-lg">{review.avatar}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <svg key={j} className={`w-3 h-3 ${j < review.rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-300">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
