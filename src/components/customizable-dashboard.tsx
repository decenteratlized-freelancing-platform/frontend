"use client"

import { useState } from "react"
import { motion, Reorder } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Layout, Save } from "lucide-react"
import WidgetContainer, { type Widget } from "./widgets/widget-container"
import StatsWidget from "./widgets/stats-widget"
import ChartWidget from "./widgets/chart-widget"
import ActivityWidget from "./widgets/activity-widget"
import QuickActionsWidget from "@/components/widgets/quick-action-widget"
import { DollarSign, Users, Clock, Eye, Star, CheckCircle } from "lucide-react"

interface CustomizableDashboardProps {
  userType: "client" | "freelancer"
}

export default function CustomizableDashboard({ userType }: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "stats-1",
      type: "stats",
      title: userType === "client" ? "Active Jobs" : "Active Projects",
      size: "small",
      position: { x: 0, y: 0 },
      data: {
        value: userType === "client" ? 12 : 5,
        change: "+2 this week",
        icon: userType === "client" ? Eye : CheckCircle,
        color: "from-blue-500 to-cyan-500",
      },
    },
    {
      id: "stats-2",
      type: "stats",
      title: userType === "client" ? "Total Spent" : "Total Earnings",
      size: "small",
      position: { x: 1, y: 0 },
      data: {
        value: userType === "client" ? 24500 : 18750,
        change: userType === "client" ? "+$1,200 this month" : "+$2,400 this month",
        icon: DollarSign,
        color: "from-green-500 to-emerald-500",
        prefix: "$",
      },
    },
    {
      id: "stats-3",
      type: "stats",
      title: userType === "client" ? "Freelancers Hired" : "Success Rate",
      size: "small",
      position: { x: 2, y: 0 },
      data: {
        value: userType === "client" ? 48 : 98,
        change: userType === "client" ? "+5 this month" : "+2% improved",
        icon: userType === "client" ? Users : Star,
        color: userType === "client" ? "from-purple-500 to-pink-500" : "from-yellow-500 to-orange-500",
        suffix: userType === "client" ? "" : "%",
      },
    },
    {
      id: "stats-4",
      type: "stats",
      title: "Response Time",
      size: "small",
      position: { x: 3, y: 0 },
      data: {
        value: userType === "client" ? 2.4 : 1.2,
        change: userType === "client" ? "-0.3h improved" : "-0.5h improved",
        icon: Clock,
        color: "from-orange-500 to-red-500",
        suffix: "h",
      },
    },
    {
      id: "chart-1",
      type: "chart",
      title: "Earnings Trend",
      size: "medium",
      position: { x: 0, y: 1 },
      data: [
        { name: "Jan", value: 4000 },
        { name: "Feb", value: 3000 },
        { name: "Mar", value: 5000 },
        { name: "Apr", value: 4500 },
        { name: "May", value: 6000 },
        { name: "Jun", value: 5500 },
      ],
    },
    {
      id: "activity-1",
      type: "activity",
      title: "Recent Activity",
      size: "medium",
      position: { x: 2, y: 1 },
      data: [
        {
          id: "1",
          type: "completion",
          title: "Project completed",
          time: "2 hours ago",
          description: "E-commerce website delivered",
        },
        {
          id: "2",
          type: "message",
          title: "New message",
          time: "4 hours ago",
          description: "Client feedback received",
        },
        {
          id: "3",
          type: "update",
          title: "Milestone reached",
          time: "1 day ago",
          description: "50% progress on mobile app",
        },
      ],
    },
    {
      id: "actions-1",
      type: "quick-actions",
      title: "Quick Actions",
      size: "small",
      position: { x: 0, y: 2 },
    },
  ])

  const [isEditMode, setIsEditMode] = useState(false)

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id))
  }

  const handleEditWidget = (id: string) => {
    // TODO: Open widget edit modal
    console.log("Edit widget:", id)
  }

  const handleAddWidget = () => {
    // TODO: Open widget selection modal
    console.log("Add widget")
  }

  const handleSaveLayout = () => {
    // TODO: Save layout to backend
    setIsEditMode(false)
    console.log("Layout saved")
  }

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case "stats":
        return (
          <StatsWidget
            title=""
            value={widget.data.value}
            change={widget.data.change}
            icon={widget.data.icon}
            color={widget.data.color}
            prefix={widget.data.prefix}
            suffix={widget.data.suffix}
          />
        )
      case "chart":
        return <ChartWidget title="" data={widget.data} />
      case "activity":
        return <ActivityWidget activities={widget.data} />
      case "quick-actions":
        return <QuickActionsWidget userType={userType} />
      default:
        return <div>Unknown widget type</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            className={
              isEditMode
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                : "border-white/20 text-white hover:bg-white/10 bg-transparent"
            }
          >
            <Layout className="w-4 h-4 mr-2" />
            {isEditMode ? "Exit Edit Mode" : "Customize Layout"}
          </Button>

          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Button
                onClick={handleAddWidget}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button
                onClick={handleSaveLayout}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </motion.div>
          )}
        </div>

        {isEditMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400">
            Drag widgets to rearrange • Click settings to edit • Click X to remove
          </motion.div>
        )}
      </motion.div>

      {/* Widgets Grid */}
      <motion.div layout className="grid grid-cols-4 gap-6 auto-rows-fr min-h-[200px]">
        <Reorder.Group axis="y" values={widgets} onReorder={setWidgets} className="contents">
          {widgets.map((widget) => (
            <Reorder.Item key={widget.id} value={widget} className="contents" dragListener={isEditMode}>
              <WidgetContainer
                widget={widget}
                onRemove={handleRemoveWidget}
                onEdit={handleEditWidget}
                isDragging={isEditMode}
              >
                {renderWidget(widget)}
              </WidgetContainer>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </motion.div>

      {/* Edit Mode Overlay */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 pointer-events-none"
        />
      )}
    </div>
  )
}
