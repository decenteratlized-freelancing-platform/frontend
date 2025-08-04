"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  CreditCard,
  Calendar,
  Target,
  Settings,
  MessageSquare,
  TrendingUp,
  HelpCircle,
  Crown,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Shield,
  Palette,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  userType: "client" | "freelancer"
  currentPath?: string
}

const clientMenuItems = [
  { name: "Dashboard", href: "/client/dashboard", icon: Home, color: "from-orange-400 to-red-400" },
  { name: "Transactions", href: "/client/transactions", icon: CreditCard, color: "from-green-400 to-emerald-400" },
  { name: "Post Job", href: "/client/post-job", icon: Calendar, color: "from-blue-400 to-cyan-400" },
  { name: "Goals", href: "/client/goals", icon: Target, color: "from-pink-400 to-rose-400" },
  { name: "Settings", href: "/client/settings", icon: Settings, color: "from-gray-400 to-slate-400" },
  { name: "Messages", href: "/client/messages", icon: MessageSquare, color: "from-purple-400 to-violet-400" },
  { name: "Analytics", href: "/client/analytics", icon: TrendingUp, color: "from-indigo-400 to-blue-400" },
  { name: "Support", href: "/client/support", icon: HelpCircle, color: "from-red-400 to-pink-400" },
]

const freelancerMenuItems = [
  { name: "Dashboard", href: "/freelancer/dashboard", icon: Home, color: "from-orange-400 to-red-400" },
  { name: "Transactions", href: "/freelancer/transactions", icon: CreditCard, color: "from-green-400 to-emerald-400" },
  { name: "Browse Jobs", href: "/freelancer/browse-jobs", icon: Calendar, color: "from-blue-400 to-cyan-400" },
  { name: "Goals", href: "/freelancer/goals", icon: Target, color: "from-pink-400 to-rose-400" },
  { name: "Settings", href: "/freelancer/settings", icon: Settings, color: "from-gray-400 to-slate-400" },
  { name: "Messages", href: "/freelancer/messages", icon: MessageSquare, color: "from-purple-400 to-violet-400" },
  { name: "Portfolio", href: "/freelancer/portfolio", icon: TrendingUp, color: "from-indigo-400 to-blue-400" },
  { name: "Support", href: "/freelancer/support", icon: HelpCircle, color: "from-red-400 to-pink-400" },
]

export default function Sidebar({ userType, currentPath }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const menuItems = userType === "client" ? clientMenuItems : freelancerMenuItems

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...")
  }

  const handleProfileEdit = () => {
    // Add profile edit logic here
    console.log("Opening profile editor...")
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Sidebar Background */}
      <div className="relative h-full">
        {/* Soft glassy background */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-xl" />

        {/* Subtle animated background */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 bg-gradient-to-b ${
            userType === "client"
              ? "from-blue-500/10 via-purple-500/5 to-transparent"
              : "from-green-500/10 via-blue-500/5 to-transparent"
          }`}
        />

        {/* Sidebar Content */}
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
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${
                      userType === "client" ? "from-blue-500 to-purple-600" : "from-green-500 to-blue-600"
                    } rounded-lg flex items-center justify-center shadow-md`}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">SmartHire</h2>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 h-auto min-w-0"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = currentPath === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ x: isCollapsed ? 0 : 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/8"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      {/* Active indicator - fixed for collapsed state */}
                      {isActive && (
                        <motion.div
                          layoutId={`activeIndicator-${userType}`}
                          className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`relative w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}
                      >
                        <item.icon className="w-4 h-4 text-white" />
                      </div>

                      {/* Label */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="font-medium text-sm relative z-10 whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/20">
                          {item.name}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Pro Upgrade Section */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="mx-3 mb-4"
              >
                <div className="relative bg-gradient-to-br from-pink-500/15 to-purple-500/15 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-4 text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Crown className="w-4 h-4 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">PRO</h3>
                  <p className="text-xs text-gray-300 mb-3 leading-relaxed">Advanced features and priority support</p>

                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-8">
                    Upgrade Pro
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Profile with Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-3"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`flex items-center gap-3 p-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 group cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Avatar className="w-8 h-8 border border-white/20 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32&text=User" />
                    <AvatarFallback
                      className={`bg-gradient-to-br ${userType === "client" ? "from-blue-500 to-purple-600" : "from-green-500 to-blue-600"} text-white font-bold text-xs`}
                    >
                      {userType === "client" ? "JC" : "JF"}
                    </AvatarFallback>
                  </Avatar>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-w-0 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <h4 className="font-medium text-white text-sm group-hover:text-blue-300 transition-colors duration-200 truncate">
                            {userType === "client" ? "John Client" : "Jane Freelancer"}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">
                            {userType === "client" ? "Premium Client" : "Top Freelancer"}
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-200" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/20">
                      {userType === "client" ? "John Client" : "Jane Freelancer"}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-xl"
                side="right"
                align="end"
              >
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userType === "client" ? "John Client" : "Jane Freelancer"}</p>
                    <p className="text-xs text-gray-400">
                      {userType === "client" ? "john@example.com" : "jane@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={handleProfileEdit}
                  className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Privacy</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer">
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Appearance</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
