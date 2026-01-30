"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import AdminSidebar from "@/components/adminComponent/admin-sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        // Skip auth check for login page
        if (pathname === "/admin/login") {
            setIsLoading(false)
            setIsAuthenticated(true)
            return
        }

        const verifyToken = async () => {
            const token = localStorage.getItem("adminToken")

            if (!token) {
                router.replace("/admin/login")
                return
            }

            try {
                const res = await fetch("http://localhost:5000/api/admin/auth/verify", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) {
                    localStorage.removeItem("adminToken")
                    localStorage.removeItem("adminEmail")
                    router.replace("/admin/login")
                    return
                }

                setIsAuthenticated(true)
            } catch (err) {
                localStorage.removeItem("adminToken")
                localStorage.removeItem("adminEmail")
                router.replace("/admin/login")
            } finally {
                setIsLoading(false)
            }
        }

        verifyToken()
    }, [pathname, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-gray-400">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    // Render login page without sidebar
    if (pathname === "/admin/login") {
        return <>{children}</>
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900">
            <AdminSidebar
                currentPath={pathname}
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
            />
            <main
                className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"
                    }`}
            >
                {children}
            </main>
        </div>
    )
}
