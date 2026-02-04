"use client"

import { useState, useMemo } from "react"
import { CurrencyContext } from "./CurrencyContext"

// Constants
const ETH_SYMBOL = "Ξ"
const ETH_CODE = "ETH"

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Fixed to 'eth' as per requirement
  const currency = "eth"
  
  // No-op setter
  const setCurrency = () => {}
  
  // Fixed rate (1:1 for ETH-to-ETH)
  const ethToInrRate = 1 

  // Memoized conversion functions
  const conversions = useMemo(() => {
    // Identity functions since we only use ETH
    const convertToEth = (amount: number) => amount
    const convertToInr = (amount: number) => amount

    const getFormattedAmount = (
      amount: number,
      _fromCurrency: "inr" | "eth" // Ignored
    ) => {
      return `${ETH_SYMBOL}${amount.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })}`
    }

    const formatSimple = (amount: number) => {
      return `${ETH_SYMBOL}${amount.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })}`
    }

    // Alias for backward compatibility - behaves same as getFormattedAmount for ETH only
    const getConvertedAmount = getFormattedAmount

    return {
      convertToEth,
      convertToInr,
      getFormattedAmount,
      formatSimple,
      getConvertedAmount,
    }
  }, [])

  const value = {
    currency,
    setCurrency,
    ethToInrRate,
    ...conversions,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}
