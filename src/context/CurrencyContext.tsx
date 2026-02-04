"use client";

import { createContext, useContext } from "react";

interface CurrencyContextType {
  getFormattedAmount: (amount: number | string) => string;
  getConvertedAmount: (amount: number | string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export default CurrencyContext;

