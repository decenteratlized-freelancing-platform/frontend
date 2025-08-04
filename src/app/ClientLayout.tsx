"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900`}>
        {/* Only hide cursor on homepage */}
        <style jsx global>{`
          .homepage-cursor-hidden * {
            cursor: none !important;
          }
        `}</style>
        {children}
      </body>
    </html>
  )
}
