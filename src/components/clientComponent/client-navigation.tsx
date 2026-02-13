"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Bell, Menu, X, Plus, BarChart3, User, Settings, Zap, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ClientNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image 
                src="/logo-w-removebg-preview.png"
                alt="SmartHire Logo"
                width={40}
                height={40}
                className="object-contain"
              />  
              <span className="text-white font-bold text-lg">SmartHire</span>
              <span className="text-blue-300 text-sm font-medium">Client</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  href="/client/dashboard"
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full group"
                >
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  href="/client/post-job"
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full group"
                >
                  <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Post Job</span>
                </Link>
              </motion.div>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4 ml-8">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white border-none">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white border-none">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white border-none">
                <Settings className="w-4 h-4" />
              </Button>
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
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl" />
              <div className="relative p-6 space-y-4">
                <Link
                  href="/client/dashboard"
                  className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 p-3 rounded-2xl"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  href="/client/post-job"
                  className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 p-3 rounded-2xl"
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">Post Job</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
