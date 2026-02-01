"use client"
import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"

interface SidebarLayoutProps {
  children: React.ReactNode
  userType: "client" | "freelancer"
}

export default function SidebarLayout({ children, userType }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar
        userType={userType}
        currentPath={pathname}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isCollapsed ? "pl-16" : "pl-64"}`}>
        <main className="relative z-10 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
