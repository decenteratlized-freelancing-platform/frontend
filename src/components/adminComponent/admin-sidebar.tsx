"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Home,
    Users,
    Briefcase,
    FileText,
    MessageSquare,
    CreditCard,
    Settings,
    LogOut,
    Shield,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Activity,
    ShieldCheck,
    Headphones,
    Megaphone,
    BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminSidebarProps {
    currentPath?: string
    isCollapsed: boolean
    onToggle: () => void
}

const adminMenuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home, color: "from-purple-400 to-pink-400" },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3, color: "from-cyan-400 to-blue-400" },
    { name: "Users", href: "/admin/users", icon: Users, color: "from-blue-400 to-cyan-400" },
    { name: "Jobs", href: "/admin/jobs", icon: Briefcase, color: "from-green-400 to-emerald-400" },
    { name: "Contracts", href: "/admin/contracts", icon: FileText, color: "from-orange-400 to-yellow-400" },
    { name: "Proposals", href: "/admin/proposals", icon: MessageSquare, color: "from-pink-400 to-rose-400" },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard, color: "from-indigo-400 to-purple-400" },
    { name: "Disputes", href: "/admin/disputes", icon: AlertTriangle, color: "from-red-400 to-orange-400" },
    { name: "Support", href: "/admin/tickets", icon: Headphones, color: "from-violet-400 to-purple-400" },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone, color: "from-amber-400 to-orange-400" },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity, color: "from-slate-400 to-zinc-400" },
    { name: "Settings", href: "/admin/settings", icon: Settings, color: "from-gray-400 to-slate-400" },
]

export default function AdminSidebar({ currentPath, isCollapsed, onToggle }: AdminSidebarProps) {
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminEmail")
        router.push("/admin/login")
    }

    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
                }`}
        >
            <div className="relative h-full">
                {/* Sidebar background */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-xl" />

                {/* Sidebar content */}
                <div className="relative h-full flex flex-col py-4">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 mb-6">
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 h-auto min-w-0"
                        >
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Menu - Scrollable */}
                    <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {adminMenuItems.map((item, index) => {
                            const isActive = currentPath === item.href
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                >
                                    <Link href={item.href}>
                                        <div
                                            className={`group relative flex items-center p-2 rounded-xl transition-all duration-200 ${isActive
                                                ? "bg-white/15 text-white shadow-sm"
                                                : "text-white/70 hover:text-white hover:bg-white/8"
                                                } ${isCollapsed ? "justify-center" : "gap-2"}`}
                                        >
                                            <div
                                                className={`relative w-7 h-7 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                                            >
                                                <item.icon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <AnimatePresence>
                                                {!isCollapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto", transition: { duration: 0.2, delay: 0.1 } }}
                                                        exit={{ opacity: 0, width: 0, transition: { duration: 0.15 } }}
                                                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mx-3 mt-auto"
                    >
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className={`w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${isCollapsed ? "justify-center p-2.5" : "justify-start gap-3 p-2.5"
                                }`}
                        >
                            <LogOut className="w-5 h-5" />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                                    >
                                        Logout
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
