"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, X, Settings } from "lucide-react"

export interface Widget {
  id: string
  type: string
  title: string
  size: "small" | "medium" | "large"
  position: { x: number; y: number }
  data?: any
}

interface WidgetContainerProps {
  widget: Widget
  onRemove: (id: string) => void
  onEdit: (id: string) => void
  children: React.ReactNode
  isDragging?: boolean
}

export default function WidgetContainer({
  widget,
  onRemove,
  onEdit,
  children,
  isDragging = false,
}: WidgetContainerProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1",
    large: "col-span-2 row-span-2",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      className={`${sizeClasses[widget.size]} ${isDragging ? "z-50" : "z-10"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
        {/* Drag Handle and Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-2 right-2 flex items-center gap-1 z-20"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(widget.id)}
            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/20"
          >
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(widget.id)}
            className="h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/20"
          >
            <X className="w-3 h-3" />
          </Button>
          <div className="cursor-grab active:cursor-grabbing text-white/60 hover:text-white p-1">
            <GripVertical className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Widget Content */}
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 h-full">{children}</CardContent>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  )
}
