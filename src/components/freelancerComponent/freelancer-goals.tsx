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
import { Target, Plus, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2, TrendingUp, Trophy } from 'lucide-react'

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
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | null>(null)
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

  const handleEditGoal = () => {
    if (editingGoal) {
      setGoals(goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal)))
      setEditingGoal(null)
      setShowEditGoal(false)
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

  const openEditDialog = (goal: Goal) => {
    setEditingGoal({ ...goal })
    setShowEditGoal(true)
  }

  const openProgressDialog = (goal: Goal) => {
    setSelectedGoalForProgress(goal)
    setShowProgressDialog(true)
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

  const completedGoals = goals.filter((g) => g.status === "completed").length
  const averageProgress = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Goal Tracking</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Your Goals</h1>
            <p className="text-gray-400">Track and manage your freelance career objectives</p>
          </div>
          <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
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
                    className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
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
                    className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-white mb-2 block">
                      Category *
                    </Label>
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors">
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
                      min="0"
                      step="1"
                      placeholder="e.g., 50000"
                      value={newGoal.target}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                          setNewGoal({ ...newGoal, target: value })
                        }
                      }}
                      className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
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
                    className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
        </div>
      </motion.div>

      {/* Stats Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed Goals</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{completedGoals}</p>
              </div>
              <Trophy className="w-10 h-10 text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Goals</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{goals.length - completedGoals}</p>
              </div>
              <Target className="w-10 h-10 text-blue-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Overall Progress</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{averageProgress}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyan-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {goals.map((goal, index) => {
            const StatusIcon = getStatusIcon(goal.status)
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-300 h-full group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <StatusIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                            {goal.title}
                          </CardTitle>
                          <p className="text-sm text-gray-400 mt-1">{goal.category}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">{goal.description}</p>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-semibold">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2 bg-white/10" />
                      {goal.category === "Financial" && (
                        <div className="flex justify-between text-sm text-gray-400 text-xs">
                          <span>${goal.current.toLocaleString()}</span>
                          <span>${goal.target.toLocaleString()}</span>
                        </div>
                      )}
                      {goal.category !== "Financial" && (
                        <div className="flex justify-between text-sm text-gray-400 text-xs">
                          <span>{goal.current}</span>
                          <span>{goal.target}</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs">{goal.deadline}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => openProgressDialog(goal)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm"
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(goal)}
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="border-white/20 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={showEditGoal} onOpenChange={setShowEditGoal}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="edit-title" className="text-white mb-2 block">
                  Goal Title *
                </Label>
                <Input
                  id="edit-title"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-white mb-2 block">
                  Description *
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category" className="text-white mb-2 block">
                    Category *
                  </Label>
                  <Select
                    value={editingGoal.category}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors">
                      <SelectValue />
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
                  <Label htmlFor="edit-target" className="text-white mb-2 block">
                    Target Value *
                  </Label>
                  <Input
                    id="edit-target"
                    type="number"
                    min="0"
                    step="1"
                    value={editingGoal.target}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                        setEditingGoal({ ...editingGoal, target: Number.parseInt(value) || 0 })
                      }
                    }}
                    className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-deadline" className="text-white mb-2 block">
                  Deadline *
                </Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={editingGoal.deadline}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                  className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditGoal(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditGoal}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Update Progress: {selectedGoalForProgress?.title}</DialogTitle>
          </DialogHeader>
          {selectedGoalForProgress && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-white">Progress: {selectedGoalForProgress.progress}%</Label>
                  <span className="text-blue-400 font-semibold">{selectedGoalForProgress.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedGoalForProgress.progress}
                  onChange={(e) => {
                    const newProgress = Number.parseInt(e.target.value)
                    setSelectedGoalForProgress({ ...selectedGoalForProgress, progress: newProgress })
                    handleUpdateProgress(selectedGoalForProgress.id, newProgress)
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400">
                  <p>
                    Current: <span className="text-white font-semibold">{selectedGoalForProgress.current}</span>
                  </p>
                  <p>
                    Target: <span className="text-white font-semibold">{selectedGoalForProgress.target}</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowProgressDialog(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setShowProgressDialog(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
