"use client"
import type React from "react"
import SidebarLayout from "@/components/sidebar-layout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.replace("/login")
      return
    }

    const role = session.user?.role
    if (role !== "client") {
      if (role === "freelancer") {
        router.replace("/freelancer/dashboard")
      } else {
        router.replace("/choose-role")
      }
    }
  }, [session, status, router])

  if (status === "loading" || !session || session.user?.role !== "client") {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <SidebarLayout userType="client">{children}</SidebarLayout>
  )
}
