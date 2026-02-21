"use client";

import React, { ReactNode } from "react";
import CurrencyContext from "./CurrencyContext";

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  
  const getFormattedAmount = (amount: number | string, currency: string = "ETH") => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return `0 ${currency}`;
    return `${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: currency === "ETH" ? 6 : 2 })} ${currency}`;
  };

  const getConvertedAmount = (amount: number | string, currency: string = "ETH") => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const symbol = currency === "ETH" ? "Ξ" : currency === "USDC" ? "$" : currency === "EURC" ? "€" : "";
    
    if (isNaN(numericAmount)) return `${symbol}0`;
    return `${symbol}${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: currency === "ETH" ? 6 : 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        getFormattedAmount,
        getConvertedAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
