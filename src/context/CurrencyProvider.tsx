"use client";

import React, { ReactNode } from "react";
import CurrencyContext from "./CurrencyContext";

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  
  const getFormattedAmount = (amount: number | string) => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "0 ETH";
    return `${numericAmount.toLocaleString()} ETH`;
  };

  const getConvertedAmount = (amount: number | string) => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "Ξ0";
    return `Ξ${numericAmount.toLocaleString()}`;
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
