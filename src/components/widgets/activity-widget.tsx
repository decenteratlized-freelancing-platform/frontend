"use client"

import { motion } from "framer-motion"
import { Clock, MessageSquare, CheckCircle } from "lucide-react"

interface ActivityItem {
  id: string
  type: "message" | "completion" | "update"
  title: string
  time: string
  description?: string
}

interface ActivityWidgetProps {
  activities: ActivityItem[]
}

const activityIcons = {
  message: MessageSquare,
  completion: CheckCircle,
  update: Clock,
}

const activityColors = {
  message: "from-blue-500 to-cyan-500",
  completion: "from-green-500 to-emerald-500",
  update: "from-orange-500 to-yellow-500",
}

export default function ActivityWidget({ activities }: ActivityWidgetProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300">Recent Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type]
          const color = activityColors[activity.type]

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
            >
              <div
                className={`w-6 h-6 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                {activity.description && <p className="text-xs text-gray-400 mt-1">{activity.description}</p>}
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
