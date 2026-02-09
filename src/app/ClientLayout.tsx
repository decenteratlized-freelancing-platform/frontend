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
    // Show loader on route change if needed, but for now we rely on the initial state.
    // Actually, forcing showLoader() on every pathname change might be jarring. 
    // Usually, we want the loader to clear as soon as the component mounts/updates.
    
    // Immediate execution - no artificial delay
    hideLoader();

    // If you want to show it on "start" of navigation, Next.js App Router 
    // handles that via loading.tsx. 
    // For this layout, we just ensure it's hidden when the route is ready.
  }, [pathname, hideLoader])
  return (
    <>
      {children}
    </>
  )
}
