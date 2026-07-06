"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAnalytics } from "@/lib/analytics";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    averageRating: number;
    numReviews: number;
    inventory?: number;
    category?: { name: string; slug: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { trackImpression, trackClick } = useAnalytics();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const isOutOfStock = (product.inventory ?? 0) === 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackImpression(product);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const el = document.getElementById(`product-${product._id}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [product, trackImpression]);

  return (
    <Link
      id={`product-${product._id}`}
      href={`/products/${product.slug}`}
      className={`group block ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => trackClick(product)}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] transition-all duration-500">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {!imgError ? (
            <img
              src={product.images[0]}
              alt={product.title}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && !isOutOfStock && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
              -{discount}%
            </span>
          )}

          {/* Out of stock */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
              Out of Stock
            </span>
          )}

          {/* Wishlist button */}
          {!isOutOfStock && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                wishlisted ? "bg-red-500 text-white shadow-lg shadow-red-500/25" : "bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-red-500 shadow-sm"
              }`}
            >
              <svg className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Add to cart overlay */}
          {!isOutOfStock && (
            <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-400 ease-out ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    productId: product._id,
                    title: product.title,
                    slug: product.slug,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: product.images[0] || "",
                    inventory: product.inventory ?? 0,
                  });
                }}
                className="w-full py-3 bg-gray-900/90 backdrop-blur-sm text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors shadow-xl"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Category tag */}
          {product.category && (
            <span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
              {product.category.name}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1.5 group-hover:text-gray-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.averageRating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-gray-400 ml-0.5">({product.numReviews})</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
