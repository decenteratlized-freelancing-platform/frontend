"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSignInClick = useCallback(() => {
    router.push("/login")
    setIsOpen(false)
  }, [router])

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-8"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">SmartHire</span>
        </Link>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
            <Button
                className="text-base px-8 py-6 rounded-xl bg-transparent text-white border-white/20 shadow-lg hover:bg-white/10 hover:scale-105 transition-transform backdrop-blur-sm bg-white/5 border border-white/10"
                onClick={handleSignInClick}
            >
                Sign In
            </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white hover:bg-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
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
            <div className="relative p-6 space-y-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
                <Button
                    variant="ghost"
                    className="w-full text-white hover:bg-white/10 justify-start"
                    onClick={handleSignInClick}
                >
                    Sign In
                </Button>
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
