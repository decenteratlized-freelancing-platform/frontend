"use client"

import { useState, useEffect, useMemo } from "react"
import { CurrencyContext } from "./CurrencyContext"

// Constants
const ETH_SYMBOL = "Ξ"
const INR_SYMBOL = "₹"
const ETH_CODE = "ETH"
const INR_CODE = "INR"

// Fetcher function for exchange rate
async function fetchEthToInrRate() {
  try {
    // Using a free, reliable API. Note: High-frequency use might require a dedicated API key.
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    )
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate")
    }
    const data = await response.json()
    return data.ethereum.inr
  } catch (error) {
    console.error("Error fetching ETH to INR rate:", error)
    // Fallback rate in case of API failure to prevent app from crashing
    return 300000
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<"inr" | "eth">("inr")
  const [ethToInrRate, setEthToInrRate] = useState<number>(300000) // Default/fallback rate

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchEthToInrRate().then(setEthToInrRate)
  }, [])

  // Memoized conversion functions
  const conversions = useMemo(() => {
    const convertToEth = (inrAmount: number) => inrAmount / ethToInrRate
    const convertToInr = (ethAmount: number) => ethAmount * ethToInrRate

    const getFormattedAmount = (
      amount: number,
      fromCurrency: "inr" | "eth"
    ) => {
      const isEth = currency === "eth"
      const targetCurrency = isEth ? ETH_CODE : INR_CODE
      const targetSymbol = isEth ? ETH_SYMBOL : INR_SYMBOL

      let displayAmount: number

      if (isEth) {
        // Target is ETH, convert if original is INR
        displayAmount = fromCurrency === "inr" ? convertToEth(amount) : amount
      } else {
        // Target is INR, convert if original is ETH
        displayAmount = fromCurrency === "eth" ? convertToInr(amount) : amount
      }

      return `${targetSymbol}${displayAmount.toLocaleString("en-IN", {
        minimumFractionDigits: isEth ? 4 : 2,
        maximumFractionDigits: isEth ? 4 : 2,
      })}`
    }

    // A simpler version for when you already have the final amount in the target currency
    const formatSimple = (amount: number) => {
      const isEth = currency === "eth"
      return `${isEth ? ETH_SYMBOL : INR_SYMBOL}${amount.toLocaleString("en-IN", {
        minimumFractionDigits: isEth ? 4 : 2,
        maximumFractionDigits: isEth ? 4 : 2,
      })}`
    }

    return {
      convertToEth,
      convertToInr,
      getFormattedAmount,
      formatSimple,
    }
  }, [currency, ethToInrRate])

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
