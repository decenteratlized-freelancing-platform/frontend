"use client"

import type React from "react"
import "./globals.css"
import { useLoader } from "@/context/LoaderContext"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { showLoader, hideLoader } = useLoader()
  const pathname = usePathname()

  useEffect(() => {
    showLoader()
    const timer = setTimeout(() => hideLoader(), 300)

    return () => {
      clearTimeout(timer)
    }
  }, [pathname, showLoader, hideLoader])
  return (
    <>
      {/* Only hide cursor on homepage */}
      <style jsx global>{`
        .homepage-cursor-hidden * {
          cursor: none !important;
        }
      `}</style>
      {children}
    </>
  )
}
