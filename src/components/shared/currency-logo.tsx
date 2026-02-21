"use client"

import { CoinsIcon } from "lucide-react"
import Image from "next/image"

interface CurrencyLogoProps {
  currency?: string
  className?: string
  size?: number
}

export function CurrencyLogo({ currency = "ETH", className = "", size = 16 }: CurrencyLogoProps) {
  if (currency === "USDC") {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Image src="/usdc.png" alt="USDC" width={size} height={size} className="object-contain" unoptimized />
      </div>
    )
  }

  if (currency === "EURC") {
    // Making it slightly larger (+10%) to visually match USDC
    const adjustedSize = size * 1.1;
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: adjustedSize, height: adjustedSize }}>
        <Image src="/eurc.png" alt="EURC" width={adjustedSize} height={adjustedSize} className="object-contain" unoptimized />
      </div>
    )
  }

  // Default to ETH icon/symbol
  return (
    <div className={`flex items-center justify-center text-indigo-400 ${className}`} style={{ width: size, height: size }}>
      <span className="font-bold" style={{ fontSize: size * 0.8 }}>Ξ</span>
    </div>
  )
}
