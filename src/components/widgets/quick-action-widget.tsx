"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Search, MessageSquare, Settings, Briefcase } from "lucide-react"
import Link from "next/link"

interface QuickActionsWidgetProps {
  userType: "client" | "freelancer"
}

interface ActionItem {
  label: string;
  href: string;
  icon: any;
  color: string;
  isSolid?: boolean;
}

export default function QuickActionsWidget({ userType }: QuickActionsWidgetProps) {
  const clientActions: ActionItem[] = [
    { label: "Post Job", href: "/client/post-job", icon: Briefcase, color: "bg-indigo-600", isSolid: true },
    { label: "Messages", href: "/client/messages", icon: MessageSquare, color: "bg-violet-600", isSolid: true },
    { label: "Settings", href: "/client/settings", icon: Settings, color: "bg-zinc-600", isSolid: true },
  ]

  const freelancerActions: ActionItem[] = [
    { label: "Browse Jobs", href: "/freelancer/browse-jobs", icon: Search, color: "bg-indigo-600", isSolid: true },
    { label: "Messages", href: "/freelancer/messages", icon: MessageSquare, color: "bg-violet-600", isSolid: true },
    { label: "Settings", href: "/freelancer/settings", icon: Settings, color: "bg-zinc-600", isSolid: true },
  ]

  const actions = userType === "client" ? clientActions : freelancerActions

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300">Quick Actions</h3>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <Button
                className={`w-full ${action.color} hover:opacity-90 hover:scale-[1.02] transition-all duration-200 group border-none text-white font-bold`}
                size="sm"
              >
                <action.icon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                {action.label}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
