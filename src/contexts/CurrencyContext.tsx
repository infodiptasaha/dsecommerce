"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "USD" | "EUR" | "GBP" | "BDT";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (cents: number) => string;
}

const symbols: Record<Currency, string> = { USD: "$", EUR: "\u20ac", GBP: "\u00a3", BDT: "\u09f3" };

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (cents) => `$${(cents / 100).toFixed(2)}`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("BDT");

  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency | null;
    if (saved && symbols[saved]) setCurrencyState(saved);
    else setCurrencyState("BDT");
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  const formatPrice = (cents: number): string => {
    const amount = cents / 100;
    return `${symbols[currency]}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export type { Currency };
