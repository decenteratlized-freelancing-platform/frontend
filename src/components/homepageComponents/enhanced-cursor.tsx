"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ClickEffect {
  id: number
  x: number
  y: number
}

interface EnhancedCursorProps {
  isActive?: boolean
}

export default function EnhancedCursor({ isActive = false }: EnhancedCursorProps) {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 }) // Start off-screen
  const [isClicking, setIsClicking] = useState(false)
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true) // Only show cursor after first mouse movement

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, input, [role="button"]')
      setIsHovering(!!isInteractive)
    }

    const handleMouseDown = () => {
      setIsClicking(true)
    }

    const handleMouseUp = () => {
      setIsClicking(false)
    }

    const handleClick = (e: MouseEvent) => {
      const newEffect = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      }

      setClickEffects((prev) => [...prev, newEffect])

      // Remove effect after animation
      setTimeout(() => {
        setClickEffects((prev) => prev.filter((effect) => effect.id !== newEffect.id))
      }, 600)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("click", handleClick)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("click", handleClick)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [])

  if (!isActive || !isVisible) return null

  return (
    <>
      {/* Main cursor - bright and vibrant */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-mode-difference"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: "translate3d(0, 0, 0)",
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-lg">
          <div className="w-full h-full bg-gradient-to-r from-cyan-300 to-purple-500 rounded-full animate-pulse opacity-80" />
        </div>
      </motion.div>

      {/* Outer black ring - the cherry on the cake! */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: mousePosition.x - 20,
          top: mousePosition.y - 20,
          transform: "translate3d(0, 0, 0)",
        }}
        animate={{
          scale: isClicking ? 1.2 : isHovering ? 0.8 : 1,
          rotate: 360,
        }}
        transition={{
          scale: { type: "spring", stiffness: 500, damping: 28 },
          rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
      >
        <div className="w-10 h-10 border-2 border-black/30 rounded-full backdrop-blur-sm">
          <div className="w-full h-full border border-white/20 rounded-full animate-pulse" />
        </div>
      </motion.div>

      {/* Click effects - vibrant ripples */}
      <AnimatePresence>
        {clickEffects.map((effect) => (
          <motion.div
            key={effect.id}
            className="fixed pointer-events-none z-[9996]"
            style={{
              left: effect.x - 20,
              top: effect.y - 20,
              transform: "translate3d(0, 0, 0)",
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-10 h-10 border-2 border-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-lg" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkle particles on hover - bright and magical */}
      {isHovering && (
        <motion.div
          className="fixed pointer-events-none z-[9995]"
          style={{
            left: mousePosition.x - 30,
            top: mousePosition.y - 30,
            transform: "translate3d(0, 0, 0)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-sm"
              style={{
                left: 30 + Math.cos((i * Math.PI * 2) / 6) * 20,
                top: 30 + Math.sin((i * Math.PI * 2) / 6) * 20,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}
    </>
  )
}
