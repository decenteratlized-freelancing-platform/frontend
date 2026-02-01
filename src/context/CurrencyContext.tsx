"use client"

import { createContext, useContext } from "react"

// Define the shape of the context
export interface CurrencyContextType {
  currency: "inr" | "eth"
  setCurrency: (currency: "inr" | "eth") => void
  ethToInrRate: number
  convertToEth: (inrAmount: number) => number
  convertToInr: (ethAmount: number) => number
  getFormattedAmount: (amount: number, fromCurrency: "inr" | "eth") => string
  formatSimple: (amount: number) => string
}

// Create the context with a default undefined value
export const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)

// Custom hook to use the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}

