"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Currency = 'INR' | 'ETH';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  getFormattedAmount: (amount: number, fromCurrency: 'INR' | 'ETH') => string;
  getConvertedAmount: (amount: number, fromCurrency: 'INR' | 'ETH') => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const INR_TO_ETH = 0.000004;

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('INR');

  const toggleCurrency = () => {
    setCurrency((prevCurrency) => (prevCurrency === 'INR' ? 'ETH' : 'INR'));
  };

  const getConvertedAmount = (amount: number, fromCurrency: 'INR' | 'ETH') => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return currency === 'ETH' ? '0.0000 ETH' : '₹0';
    }

    // If display currency is same as from currency, just format it
    if (currency === fromCurrency) {
      if (currency === 'ETH') {
        return `${amount.toFixed(4)} ETH`;
      }
      return `₹${amount.toLocaleString('en-IN')}`;
    }

    // If conversion is needed
    if (currency === 'ETH' && fromCurrency === 'INR') {
      return `${(amount * INR_TO_ETH).toFixed(4)} ETH`;
    }

    if (currency === 'INR' && fromCurrency === 'ETH') {
      const ETH_TO_INR = 1 / INR_TO_ETH;
      return `₹${(amount * ETH_TO_INR).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // fallback to original currency if no conversion rule applies
    return fromCurrency === 'ETH' ? `${amount.toFixed(4)} ETH` : `₹${amount.toLocaleString('en-IN')}`;
  };

  const getFormattedAmount = (amount: number, fromCurrency: 'INR' | 'ETH') => {
    return getConvertedAmount(amount, fromCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, getFormattedAmount, getConvertedAmount }}>
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
