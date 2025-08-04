import type React from "react"
import SidebarLayout from "@/components/sidebar-layout"

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarLayout userType="freelancer">{children}</SidebarLayout>
}
