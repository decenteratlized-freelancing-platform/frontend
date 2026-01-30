"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ProfileDialog } from "@/components/shared/profile-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Users,
  Bell,
  Shield,
  Palette,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WalletSidebarButton } from "./WalletSidebarButton";

interface SidebarProps {
  userType: "client" | "freelancer";
  currentPath?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const clientMenuItems = [
  { name: "Dashboard", href: "/client/dashboard", icon: Home, color: "from-orange-400 to-red-400" },
  { name: "Discover", href: "/client/discover", icon: Users, color: "from-cyan-400 to-sky-400" },
  { name: "Transactions", href: "/client/transactions", icon: CreditCard, color: "from-green-400 to-emerald-400" },
  { name: "Post Job", href: "/client/post-job", icon: Calendar, color: "from-blue-400 to-cyan-400" },
  { name: "Goals", href: "/client/goals", icon: Target, color: "from-pink-400 to-rose-400" },
  { name: "Disputes", href: "/client/disputes", icon: AlertTriangle, color: "from-red-400 to-orange-400" },
  { name: "Settings", href: "/client/settings", icon: Settings, color: "from-gray-400 to-slate-400" },
  { name: "Messages", href: "/client/messages", icon: MessageSquare, color: "from-purple-400 to-violet-400" },
  { name: "Analytics", href: "/client/analytics", icon: TrendingUp, color: "from-indigo-400 to-blue-400" },
  { name: "Support", href: "/client/support", icon: HelpCircle, color: "from-red-400 to-pink-400" },
];

const freelancerMenuItems = [
  { name: "Dashboard", href: "/freelancer/dashboard", icon: Home, color: "from-orange-400 to-red-400" },
  { name: "Transactions", href: "/freelancer/transactions", icon: CreditCard, color: "from-green-400 to-emerald-400" },
  { name: "Browse Jobs", href: "/freelancer/browse-jobs", icon: Calendar, color: "from-blue-400 to-cyan-400" },
  { name: "Goals", href: "/freelancer/goals", icon: Target, color: "from-pink-400 to-rose-400" },
  { name: "Disputes", href: "/freelancer/disputes", icon: AlertTriangle, color: "from-orange-400 to-red-400" },
  { name: "Settings", href: "/freelancer/settings", icon: Settings, color: "from-gray-400 to-slate-400" },
  { name: "Messages", href: "/freelancer/messages", icon: MessageSquare, color: "from-purple-400 to-violet-400" },
  { name: "Portfolio", href: "/freelancer/portfolio", icon: TrendingUp, color: "from-indigo-400 to-blue-400" },
  { name: "Support", href: "/freelancer/support", icon: HelpCircle, color: "from-red-400 to-pink-400" },
];

export default function Sidebar({ userType, currentPath, isCollapsed, onToggle }: SidebarProps) {
  const [user, setUser] = useState<{ name: string; email: string; image?: string }>(
    {
      name: "",
      email: "",
      image: "",
    }
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = userType === "client" ? clientMenuItems : freelancerMenuItems;
  const { data: session } = useSession();
  const router = useRouter();


  // Sync with session, but respect local overrides for image
  useEffect(() => {
    if (session?.user) {
      setUser(prev => {
        // Only update image from session if we don't have a local override
        const localImage = localStorage.getItem("userImage");
        return {
          ...prev,
          name: session.user.name || prev.name,
          email: session.user.email || prev.email,
          image: localImage || session.user.image || prev.image,
        };
      });
    } else {
      // Manual login fallback
      const fullNameRaw = localStorage.getItem("fullName") || "";
      const emailRaw = localStorage.getItem("email") || "";
      const localImage = localStorage.getItem("userImage") || "";

      setUser({
        name: fullNameRaw === "undefined" ? "" : fullNameRaw,
        email: emailRaw === "undefined" ? "" : emailRaw,
        image: localImage
      });
    }
  }, [session]);

  // Listen for local image updates (uploads/removals)
  useEffect(() => {
    const handleImageUpdate = () => {
      const storedImage = localStorage.getItem("userImage");
      setUser(prev => ({
        ...prev,
        image: storedImage || session?.user?.image || ""
      }));
    };

    window.addEventListener("userImageUpdated", handleImageUpdate);

    // Check once on mount to ensure we are in sync
    handleImageUpdate();

    return () => {
      window.removeEventListener("userImageUpdated", handleImageUpdate);
    };
  }, [session]); // Depend on session so fallback works if session loads later

  const handleLogout = () => {
    if (session) {
      // OAuth logout
      localStorage.clear();
      signOut({ callbackUrl: "/login" });
    } else {
      // Manual logout
      localStorage.clear();
      router.push("/login");
    }
  };

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
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${userType === "client" ? "from-blue-500 to-purple-600" : "from-green-500 to-blue-600"
                      } rounded-lg flex items-center justify-center shadow-md`}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">SmartHire</h2>
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

          {/* Menu */}
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = currentPath === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={item.href}>
                    <div
                      className={`group relative flex items-center p-2.5 rounded-xl transition-all duration-200 ${isActive
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/8"
                        } ${isCollapsed ? "justify-center" : "gap-3"}`}
                    >
                      <div
                        className={`relative w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <item.icon className="w-4 h-4 text-white" />
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
              );
            })}
          </nav>

          {/* Profile dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-3 space-y-3"
          >
            {/* Wallet connect button */}
            <WalletSidebarButton isCollapsed={isCollapsed} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`flex items-center gap-3 p-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer ${isCollapsed ? "justify-center" : ""
                    }`}
                >
                  <UserAvatar user={user} className="w-8 h-8 border border-white/20 bg-gray-700" />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm truncate">{user.name || "User"}</h4>
                      <p className="text-xs text-gray-400 truncate">{user.email || "user@example.com"}</p>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-xl">
                <DropdownMenuLabel className="text-white">
                  <p className="text-sm font-medium">{user.name || "User"}</p>
                  <p className="text-xs text-gray-400">{user.email || ""}</p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  className="cursor-pointer text-white/90 hover:bg-white/10 hover:text-white focus:text-white"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>

                <Link href="/notifications" className="block">
                  <DropdownMenuItem className="cursor-pointer text-white/90 hover:bg-white/10 hover:text-white focus:text-white">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/security" className="block">
                  <DropdownMenuItem className="cursor-pointer text-white/90 hover:bg-white/10 hover:text-white focus:text-white">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Password & Security</span>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="bg-white/10 hover:text-red-600" />

                <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div >
        </div >
      </div >

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        email={user.email}
        userType={userType}
      />
    </motion.div >
  );
}
