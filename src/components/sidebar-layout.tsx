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

  const backgroundGradient =
    userType === "client"
      ? "from-slate-900 via-blue-900/20 to-slate-900"
      : "from-slate-900 via-green-900/20 to-slate-900"

  const backgroundElements =
    userType === "client" ? (
      <>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/4 to-blue-500/4 rounded-full blur-3xl animate-pulse" />
      </>
    ) : (
      <>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500/8 to-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-teal-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/4 to-green-500/4 rounded-full blur-3xl animate-pulse" />
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
