import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client/layout"
import "./globals.css"

export const metadata: Metadata = {
  title: "SmartHire - The Future of Freelancing",
  description:
    "Bridge Web2 and Web3 with AI-generated smart contracts, seamless crypto & fiat payments, and blockchain-secured agreements.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
