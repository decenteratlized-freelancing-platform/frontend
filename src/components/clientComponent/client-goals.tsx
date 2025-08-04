"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"

const goals = [
  {
    id: 1,
    title: "Launch E-commerce Platform",
    description: "Complete development and launch of the new e-commerce platform",
    progress: 75,
    target: 100,
    deadline: "2024-02-15",
    status: "in-progress",
    category: "Development",
    milestones: [
      { title: "Frontend Development", completed: true },
      { title: "Backend API", completed: true },
      { title: "Payment Integration", completed: true },
      { title: "Testing & QA", completed: false },
      { title: "Deployment", completed: false },
    ],
  },
  {
    id: 2,
    title: "Hire 5 New Freelancers",
    description: "Expand team by hiring 5 skilled freelancers across different domains",
    progress: 60,
    target: 100,
    deadline: "2024-01-30",
    status: "in-progress",
    category: "Team Building",
    milestones: [
      { title: "React Developer", completed: true },
      { title: "UI/UX Designer", completed: true },
      { title: "Content Writer", completed: true },
      { title: "Mobile Developer", completed: false },
      { title: "DevOps Engineer", completed: false },
    ],
  },
  {
    id: 3,
    title: "Reduce Project Costs by 20%",
    description: "Optimize project costs while maintaining quality standards",
    progress: 45,
    target: 100,
    deadline: "2024-03-01",
    status: "in-progress",
    category: "Finance",
    milestones: [
      { title: "Cost Analysis", completed: true },
      { title: "Vendor Negotiation", completed: true },
      { title: "Process Optimization", completed: false },
      { title: "Implementation", completed: false },
    ],
  },
  {
    id: 4,
    title: "Complete Mobile App Project",
    description: "Finish the mobile app development project ahead of schedule",
    progress: 100,
    target: 100,
    deadline: "2024-01-05",
    status: "completed",
    category: "Development",
    milestones: [
      { title: "Design Phase", completed: true },
      { title: "Development", completed: true },
      { title: "Testing", completed: true },
      { title: "App Store Submission", completed: true },
    ],
  },
]

export default function ClientGoals() {
  const [showAddGoal, setShowAddGoal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border border-green-500/30"
      case "in-progress":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      case "overdue":
        return "bg-red-500/20 text-red-300 border border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle
      case "in-progress":
        return Clock
      case "overdue":
        return AlertCircle
      default:
        return Target
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <Target className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-white">Goal Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Your Goals
            </span>
          </h1>
          <p className="text-xl text-gray-300">Track and achieve your business objectives</p>
        </div>
        <Button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Goal
        </Button>
      </motion.div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Create New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Goal Title</label>
                  <Input
                    placeholder="Enter goal title"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Deadline</label>
                  <Input type="date" className="bg-white/5 border-white/10 text-white placeholder:text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe your goal"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-4">
                <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                  Create Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddGoal(false)}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal, index) => {
          const StatusIcon = getStatusIcon(goal.status)
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">{goal.title}</CardTitle>
                        <p className="text-sm text-gray-400">{goal.category}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{goal.description}</p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white font-semibold">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {goal.deadline}</span>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Milestones</h4>
                    <div className="space-y-1">
                      {goal.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              milestone.completed ? "bg-green-500" : "bg-gray-600 border border-gray-500"
                            }`}
                          >
                            {milestone.completed && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={milestone.completed ? "text-green-300 line-through" : "text-gray-300"}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      Update Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Edit Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
