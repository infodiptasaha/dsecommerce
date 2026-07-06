const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BDT: "৳",
};

const currencyDivisors: Record<string, number> = {
  USD: 100,
  EUR: 100,
  GBP: 100,
  BDT: 100,
};

export function formatPrice(cents: number, currency: string = "USD"): string {
  const symbol = currencySymbols[currency] || "$";
  const divisor = currencyDivisors[currency] || 100;
  const amount = cents / divisor;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrencySymbol(currency: string = "USD"): string {
  return currencySymbols[currency] || "$";
}
