export const amount = (value: number): number => Math.round(value * 100) / 100;

export const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount(value));
