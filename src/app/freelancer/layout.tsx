"use client"
import type React from "react"
import SidebarLayout from "@/components/sidebar-layout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isManualAuth, setIsManualAuth] = useState(false)
  const [manualRole, setManualRole] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check for manual login (localStorage token)
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (token && role) {
      setIsManualAuth(true)
      setManualRole(role)
    }
    setIsChecking(false)
  }, [])

  useEffect(() => {
    if (isChecking) return
    if (status === "loading") return

    // Check OAuth session first
    if (session) {
      const role = session.user?.role
      if (role !== "freelancer") {
        if (role === "client") {
          router.replace("/client/dashboard")
        } else {
          router.replace("/choose-role")
        }
      }
      return
    }

    // Check manual login
    if (isManualAuth) {
      if (manualRole !== "freelancer") {
        if (manualRole === "client") {
          router.replace("/client/dashboard")
        } else {
          router.replace("/choose-role")
        }
      }
      return
    }

    // No auth at all
    router.replace("/login")
  }, [session, status, router, isManualAuth, manualRole, isChecking])

  // Show loading while checking auth
  if (isChecking || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  // Check if user is authenticated as freelancer via either method
  const isOAuthFreelancer = session?.user?.role === "freelancer"
  const isManualFreelancer = isManualAuth && manualRole === "freelancer"

  if (!isOAuthFreelancer && !isManualFreelancer) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  return <SidebarLayout userType="freelancer">{children}</SidebarLayout>
}
