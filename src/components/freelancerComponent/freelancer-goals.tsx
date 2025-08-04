"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Target, Plus, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from "lucide-react"

interface Goal {
  id: number
  title: string
  description: string
  progress: number
  target: number
  current: number
  deadline: string
  status: "in-progress" | "completed" | "overdue"
  category: string
}

const initialGoals: Goal[] = [
  {
    id: 1,
    title: "Earn $50,000 This Year",
    description: "Reach annual income target through quality freelance projects",
    progress: 75,
    target: 50000,
    current: 37500,
    deadline: "2024-12-31",
    status: "in-progress",
    category: "Financial",
  },
  {
    id: 2,
    title: "Complete 25 Projects",
    description: "Successfully deliver 25 high-quality projects to build portfolio",
    progress: 68,
    target: 25,
    current: 17,
    deadline: "2024-12-31",
    status: "in-progress",
    category: "Professional",
  },
  {
    id: 3,
    title: "Learn React Native",
    description: "Master React Native development to expand service offerings",
    progress: 40,
    target: 100,
    current: 40,
    deadline: "2024-06-30",
    status: "in-progress",
    category: "Skill Development",
  },
  {
    id: 4,
    title: "Build Personal Website",
    description: "Create a professional portfolio website to showcase work",
    progress: 100,
    target: 100,
    current: 100,
    deadline: "2024-01-15",
    status: "completed",
    category: "Marketing",
  },
]

export default function FreelancerGoals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    category: "",
  })

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.target && newGoal.deadline && newGoal.category) {
      const goal: Goal = {
        id: Date.now(),
        title: newGoal.title,
        description: newGoal.description,
        progress: 0,
        target: Number.parseInt(newGoal.target),
        current: 0,
        deadline: newGoal.deadline,
        status: "in-progress",
        category: newGoal.category,
      }
      setGoals([...goals, goal])
      setNewGoal({ title: "", description: "", target: "", deadline: "", category: "" })
      setShowAddGoal(false)
    }
  }

  const handleUpdateProgress = (goalId: number, newProgress: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              progress: newProgress,
              current: Math.round((newProgress / 100) * goal.target),
              status: newProgress === 100 ? "completed" : "in-progress",
            }
          : goal,
      ),
    )
  }

  const handleDeleteGoal = (goalId: number) => {
    setGoals(goals.filter((goal) => goal.id !== goalId))
  }

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
            <span className="text-sm font-medium text-white">Goal Tracking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Your Goals
            </span>
          </h1>
          <p className="text-xl text-gray-300">Track your freelance career objectives</p>
        </div>

        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl">
              <Plus className="w-5 h-5 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white mb-2 block">
                  Goal Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your goal title..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white mb-2 block">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white mb-2 block">
                    Category *
                  </Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Skill Development">Skill Development</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target" className="text-white mb-2 block">
                    Target Value *
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="e.g., 50000"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline" className="text-white mb-2 block">
                  Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddGoal(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddGoal}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  disabled={
                    !newGoal.title || !newGoal.description || !newGoal.target || !newGoal.deadline || !newGoal.category
                  }
                >
                  Add Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {goals.map((goal, index) => {
            const StatusIcon = getStatusIcon(goal.status)
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
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
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingGoal(goal)}
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-gray-400 hover:text-red-400 hover:bg-white/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
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
                      {goal.category === "Financial" && (
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>${goal.current.toLocaleString()}</span>
                          <span>${goal.target.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {goal.deadline}</span>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          >
                            Update Progress
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle>Update Progress: {goal.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-white mb-2 block">Progress: {goal.progress}%</Label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={goal.progress}
                                onChange={(e) => handleUpdateProgress(goal.id, Number.parseInt(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            <div className="text-sm text-gray-400">
                              Current: {goal.current} / Target: {goal.target}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
        </AnimatePresence>
      </div>
    </div>
  )
}
