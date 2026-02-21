"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle } from "lucide-react"

interface HelpTooltipProps {
  content: string
  side?: "top" | "bottom" | "left" | "right"
}

export function HelpTooltip({ content, side = "top" }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div className="relative inline-block ml-1 align-middle">
      <HelpCircle
        className="w-3.5 h-3.5 text-zinc-500 cursor-help hover:text-zinc-300 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onTouchStart={() => setIsVisible(true)}
        onTouchEnd={() => setIsVisible(false)}
      />
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl text-xs text-zinc-300 leading-relaxed pointer-events-none ${sideClasses[side]}`}
          >
            {content}
            <div
              className={`absolute w-2 h-2 bg-zinc-900 border-zinc-700 rotate-45 ${
                side === "top"
                  ? "top-full -mt-1 left-1/2 -translate-x-1/2 border-b border-r"
                  : side === "bottom"
                  ? "bottom-full -mb-1 left-1/2 -translate-x-1/2 border-t border-l"
                  : side === "left"
                  ? "left-full -ml-1 top-1/2 -translate-y-1/2 border-t border-r"
                  : "right-full -mr-1 top-1/2 -translate-y-1/2 border-b border-l"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
