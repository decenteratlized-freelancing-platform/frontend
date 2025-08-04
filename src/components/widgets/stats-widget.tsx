"use client"
import { TrendingUp } from "lucide-react"
import AnimatedCounter from "@/components/homepageComponents/animated-counter"
import type { LucideIcon } from "lucide-react"

interface StatsWidgetProps {
  title: string
  value: number
  change: string
  icon: LucideIcon
  color: string
  prefix?: string
  suffix?: string
}

export default function StatsWidget({
  title,
  value,
  change,
  icon: Icon,
  color,
  prefix = "",
  suffix = "",
}: StatsWidgetProps) {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-300">{title}</div>
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="text-2xl font-bold text-white mb-2">
          <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
        </div>
        <p className="text-xs text-green-400 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          {change}
        </p>
      </div>
    </div>
  )
}
