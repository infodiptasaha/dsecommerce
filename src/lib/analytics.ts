"use client";

import { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("analytics_session");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("analytics_session", id);
  }
  return id;
}

export function useAnalytics() {
  const { data: session } = useSession();
  const tracked = useRef(new Set<string>());

  const track = useCallback(async (event: string, data: Record<string, any> = {}) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          sessionId: getSessionId(),
          userId: session?.user?.email,
          ...data,
        }),
      });
    } catch {}
  }, [session]);

  const trackImpression = useCallback((product: any) => {
    const key = `imp_${product._id}`;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    track("impression", {
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      category: product.category?.slug || product.category,
      price: product.price,
    });
  }, [track]);

  const trackClick = useCallback((product: any) => {
    track("click", {
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      category: product.category?.slug || product.category,
      price: product.price,
    });
  }, [track]);

  const trackAddToCart = useCallback((product: any, quantity: number = 1) => {
    track("add_to_cart", {
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      category: product.category?.slug || product.category,
      price: product.price,
      metadata: { quantity },
    });
  }, [track]);

  const trackCheckout = useCallback((items: any[], total: number) => {
    track("checkout", {
      metadata: { itemCount: items.length, total },
    });
  }, [track]);

  const trackPurchase = useCallback((orderId: string, total: number) => {
    track("purchase", {
      metadata: { orderId, total },
    });
  }, [track]);

  return { track, trackImpression, trackClick, trackAddToCart, trackCheckout, trackPurchase };
}
