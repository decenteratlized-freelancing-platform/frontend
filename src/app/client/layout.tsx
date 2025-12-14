import type React from "react"
import SidebarLayout from "@/components/sidebar-layout"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <SidebarLayout userType="client">{children}</SidebarLayout>
)
}
