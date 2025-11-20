"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Users, Shield, Zap, Wallet, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWalletConnection } from "@/hooks/useWalletConnection"

const navItems = [
  { name: "Home", href: "#home", icon: Home },
  { name: "Features", href: "#features", icon: Zap },
  { name: "How It Works", href: "#how-it-works", icon: Users },
  { name: "Security", href: "#security", icon: Shield },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const router = useRouter()
  const { address, connectWallet, disconnectWallet, isConnecting } = useWalletConnection()

  useEffect(() => {
    const handleScroll = () => {
      // Update active section based on scroll position
      const sections = ["home", "features", "how-it-works", "security"]
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)

    if (element) {
      const offsetTop = element.offsetTop - 120 // Account for fixed nav height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }

    setIsOpen(false)
  }

  const handleSignInClick = useCallback(() => {
    router.push("/login")
    setIsOpen(false)
  }, [router])

  const handleWalletClick = useCallback(async () => {
    await connectWallet()
    setIsOpen(false)
  }, [connectWallet])

  const walletLabel = useMemo(() => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return isConnecting ? "Connecting..." : "Connect Wallet"
  }, [address, isConnecting])

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 pb-6"
      >
        <div className="relative max-w-fit">
          {/* Glassy background with liquid effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl" />

          {/* Animated liquid blob background */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 1, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"
          />

          {/* Navigation content */}
          <div className="relative flex items-center gap-8 px-8 py-4">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavClick("#home")}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">SmartHire</span>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item, index) => {
                const isActive = activeSection === item.href.replace("#", "")
                return (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                    className={`flex items-center gap-2 transition-all duration-300 px-4 py-2 rounded-full group ${isActive ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{item.name}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4 ml-8">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white border-none"
                onClick={handleSignInClick}
              >
                Sign In
              </Button>

              {address ? (
                <div className="relative group">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {walletLabel}
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <button
                      onClick={disconnectWallet}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors rounded-xl"
                    >
                      <span className="w-4 h-4">🚪</span>
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={handleWalletClick}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  {walletLabel}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10 ml-auto"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-28 left-4 right-4 z-40 md:hidden"
          >
            <div className="relative">
              {/* Glassy background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl" />

              {/* Animated background */}
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"
              />

              {/* Mobile menu content */}
              <div className="relative p-6 space-y-4">
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.href.replace("#", "")
                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className={`flex items-center gap-3 transition-all duration-300 p-3 rounded-2xl group w-full text-left ${isActive ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">{item.name}</span>
                    </motion.button>
                  )
                })}

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full text-white hover:bg-white/10 justify-start"
                    onClick={handleSignInClick}
                  >
                    Sign In
                  </Button>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    onClick={handleWalletClick}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4 mr-2" />
                    )}
                    {walletLabel}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
