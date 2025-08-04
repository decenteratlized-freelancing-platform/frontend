"use client"

import { useEffect, useState } from "react"

interface TrailPoint {
  x: number
  y: number
  id: number
  timestamp: number
}

interface MouseTrailProps {
  isActive?: boolean
}

export default function MouseTrail({ isActive = false }: MouseTrailProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 }) // Start off-screen
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let mouseX = -100
    let mouseY = -100
    let trailId = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setMousePosition({ x: mouseX, y: mouseY })
      setIsVisible(true) // Only show after first mouse movement
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      setTrail([]) // Clear trail when mouse leaves
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    const updateTrail = () => {
      if (!isActive || !isVisible) return

      const now = Date.now()
      setTrail((prevTrail) => {
        const newPoint = { x: mouseX, y: mouseY, id: trailId++, timestamp: now }
        const newTrail = [newPoint, ...prevTrail.slice(0, 19)] // Back to 20 particles

        // Remove old points
        return newTrail.filter((point) => now - point.timestamp < 1000)
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)
    const interval = setInterval(updateTrail, 16) // Faster updates for smoother trail

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      clearInterval(interval)
    }
  }, [isActive, isVisible])

  if (!isActive || !isVisible) return null

  return (
    <>
      {/* Enhanced trail particles - vibrant and glowing */}
      <div className="fixed inset-0 pointer-events-none z-[9997]">
        {trail.map((point, index) => {
          const age = (Date.now() - point.timestamp) / 1000
          const opacity = Math.max(0, ((1 - age) * (20 - index)) / 20)
          const scale = Math.max(0.1, (20 - index) / 20)

          return (
            <div
              key={point.id}
              className="absolute"
              style={{
                left: point.x - 4,
                top: point.y - 4,
                opacity,
                transform: `scale(${scale}) translate3d(0, 0, 0)`,
                transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
              }}
            >
              {/* Main particle - bright and vibrant */}
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm" />

              {/* Glow effect - more prominent */}
              {index < 8 && (
                <div className="absolute inset-0 w-4 h-4 -translate-x-1 -translate-y-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-sm" />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
