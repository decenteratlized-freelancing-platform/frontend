"use client"
import type React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"

interface SidebarLayoutProps {
  children: React.ReactNode
  userType: "client" | "freelancer"
}

export default function SidebarLayout({ children, userType }: SidebarLayoutProps) {
  const pathname = usePathname()

  // Darker blue/purple hero gradient (closer to homepage but much darker)
  const backgroundGradient = "from-[#030517] via-[#06132a]/80 to-[#041028]"

  const backgroundElements = (
    <>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-900/8 to-pink-900/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-900/6 to-blue-800/6 rounded-full blur-3xl animate-pulse" />
      {/* subtle vignette to deepen edges */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/30 mix-blend-multiply rounded-lg" />
    </>
  )

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient}`}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">{backgroundElements}</div>

      {/* Sidebar */}
      <Sidebar userType={userType} currentPath={pathname} />

      {/* Main Content Area */}
      <div className="pl-64">
        <main className="relative z-10 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
