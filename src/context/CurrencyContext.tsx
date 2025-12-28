"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Currency = 'INR' | 'ETH';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  getConvertedAmount: (amountInINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const INR_TO_ETH = 0.000004;

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('INR');

  const toggleCurrency = () => {
    setCurrency((prevCurrency) => (prevCurrency === 'INR' ? 'ETH' : 'INR'));
  };

  const getConvertedAmount = (amountInINR: number) => {
    if (currency === 'INR') {
      return `₹${amountInINR.toLocaleString('en-IN')}`;
    } else {
      const amountInETH = amountInINR * INR_TO_ETH;
      return `${amountInETH.toFixed(4)} ETH`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, getConvertedAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
