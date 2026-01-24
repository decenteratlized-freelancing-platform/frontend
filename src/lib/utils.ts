import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency: 'INR' | 'ETH') => {
  if (currency === 'ETH') return `${amount.toFixed(4)} ETH`;
  return amount.toLocaleString('en-IN', { style: 'currency', currency: currency });
};
