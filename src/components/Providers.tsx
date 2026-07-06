"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrencyProvider>
        <CartProvider>{children}</CartProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}
