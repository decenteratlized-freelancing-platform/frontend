"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCurrency } from "@/context/CurrencyContext";
import { Target, Plus, Edit, Trash2, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface Milestone {
  id: string
  title: string
  completed: boolean
  dueDate: string
}

interface Goal {
  id: string
  title: string
  description: string
  category: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  progress: number
  targetDate: string
  createdAt: string
  milestones: Milestone[]
  priority: "low" | "medium" | "high"
}

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Increase Monthly Revenue",
    description: "Achieve ₹4,000,000 monthly recurring revenue through new client acquisitions",
    category: "Financial",
    status: "in-progress",
    progress: 65,
    targetDate: "2024-12-31",
    createdAt: "2024-01-15",
    priority: "high",
    milestones: [
      { id: "m1", title: "Reach ₹2,400,000 MRR", completed: true, dueDate: "2024-06-30" },
      { id: "m2", title: "Reach ₹3,200,000 MRR", completed: true, dueDate: "2024-09-30" },
      { id: "m3", title: "Reach ₹4,000,000 MRR", completed: false, dueDate: "2024-12-31" },
    ],
  },
  {
    id: "2",
    title: "Build Strong Client Network",
    description: "Establish relationships with 25 high-quality clients",
    category: "Networking",
    status: "in-progress",
    progress: 40,
    targetDate: "2024-11-30",
    createdAt: "2024-02-01",
    priority: "medium",
    milestones: [
      { id: "m4", title: "Connect with 10 clients", completed: true, dueDate: "2024-05-31" },
      { id: "m5", title: "Connect with 20 clients", completed: false, dueDate: "2024-08-31" },
      { id: "m6", title: "Connect with 25 clients", completed: false, dueDate: "2024-11-30" },
    ],
  },
  {
    id: "3",
    title: "Launch New Service Line",
    description: "Develop and launch AI consulting services",
    category: "Business Development",
    status: "pending",
    progress: 15,
    targetDate: "2024-10-15",
    createdAt: "2024-03-01",
    priority: "high",
    milestones: [
      { id: "m7", title: "Market research", completed: true, dueDate: "2024-04-30" },
      { id: "m8", title: "Service development", completed: false, dueDate: "2024-07-31" },
      { id: "m9", title: "Launch campaign", completed: false, dueDate: "2024-10-15" },
    ],
  },
]

export default function ClientGoals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    targetDate: "",
    priority: "medium" as "low" | "medium" | "high",
    milestones: [{ title: "", dueDate: "" }],
  })
  const { getConvertedAmount } = useCurrency();

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "in-progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "overdue":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const addGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      status: "pending",
      progress: 0,
      targetDate: newGoal.targetDate,
      createdAt: new Date().toISOString().split("T")[0],
      priority: newGoal.priority,
      milestones: newGoal.milestones
        .map((m, index) => ({
          id: `${Date.now()}-${index}`,
          title: m.title,
          completed: false,
          dueDate: m.dueDate,
        }))
        .filter((m) => m.title.trim() !== ""),
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: "",
      description: "",
      category: "",
      targetDate: "",
      priority: "medium",
      milestones: [{ title: "", dueDate: "" }],
    })
    setIsAddDialogOpen(false)
  }

  const updateGoal = () => {
    if (!editingGoal) return

    setGoals(goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal)))
    setIsEditDialogOpen(false)
    setEditingGoal(null)
  }

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter((goal) => goal.id !== goalId))
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const updatedMilestones = goal.milestones.map((milestone) =>
            milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone,
          )

          const completedCount = updatedMilestones.filter((m) => m.completed).length
          const progress = Math.round((completedCount / updatedMilestones.length) * 100)

          let status: Goal["status"] = "pending"
          if (progress === 100) status = "completed"
          else if (progress > 0) status = "in-progress"

          return {
            ...goal,
            milestones: updatedMilestones,
            progress,
            status,
          }
        }
        return goal
      }),
    )
  }

  const addMilestone = () => {
    setNewGoal({
      ...newGoal,
      milestones: [...newGoal.milestones, { title: "", dueDate: "" }],
    })
  }

  const updateMilestone = (index: number, field: "title" | "dueDate", value: string) => {
    const updatedMilestones = newGoal.milestones.map((milestone, i) =>
      i === index ? { ...milestone, [field]: value } : milestone,
    )
    setNewGoal({ ...newGoal, milestones: updatedMilestones })
  }

  const removeMilestone = (index: number) => {
    setNewGoal({
      ...newGoal,
      milestones: newGoal.milestones.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Goals & Objectives
              </h1>
              <p className="text-gray-400 text-lg">Track your progress and achieve your business objectives</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* ... existing dialog content ... */}
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Create New Goal</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Set a new goal with milestones to track your progress
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">
                      Goal Title
                    </Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter goal title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Describe your goal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-white">
                        Category
                      </Label>
                      <Input
                        id="category"
                        value={newGoal.category}
                        onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="e.g., Financial, Marketing"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority" className="text-white">
                        Priority
                      </Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewGoal({ ...newGoal, priority: value })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20">
                          <SelectItem value="low" className="text-white">
                            Low
                          </SelectItem>
                          <SelectItem value="medium" className="text-white">
                            Medium
                          </SelectItem>
                          <SelectItem value="high" className="text-white">
                            High
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="targetDate" className="text-white">
                      Target Date
                    </Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Milestones</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMilestone}
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {newGoal.milestones.map((milestone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, "title", e.target.value)}
                            className="bg-white/10 border-white/20 text-white flex-1"
                            placeholder="Milestone title"
                          />
                          <Input
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                            className="bg-white/10 border-white/20 text-white w-40"
                          />
                          {newGoal.milestones.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMilestone(index)}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addGoal}
                    className="bg-white text-black hover:bg-white hover:shadow-blue-500/25"
                    disabled={!newGoal.title || !newGoal.description}
                  >
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{goals.length}</p>
                      <p className="text-sm text-gray-400">Total Goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {goals.filter((g) => g.status === "completed").length}
                      </p>
                      <p className="text-sm text-gray-400">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {goals.filter((g) => g.status === "in-progress").length}
                      </p>
                      <p className="text-sm text-gray-400">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {goals.length === 0 ? 0 : Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
                      </p>
                      <p className="text-sm text-gray-400">Avg Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

                    {/* Goals List */}

                    <div className="space-y-6">

                      <AnimatePresence>

                        {goals.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg text-center"
                          >
                            <Target className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-xl font-semibold text-white mb-2">No Goals Yet!</p>
                            <p className="text-gray-400">Start by adding a new goal to track your progress.</p>
                          </motion.div>
                        ) : (
                          goals.map((goal, index) => (
                            <motion.div

                            key={goal.id}

                            initial={{ opacity: 0, y: 20 }}

                            animate={{ opacity: 1, y: 0 }}

                            exit={{ opacity: 0, y: -20 }}

                            transition={{ duration: 0.3, delay: index * 0.1 }}

                          >

                            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 transition-all duration-300 shadow-lg">

                              <CardHeader className="pb-4">

                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                                  <div className="flex-1 space-y-3">

                                    <div className="flex flex-wrap items-center gap-3">

                                      <CardTitle className="text-xl text-white">{goal.title}</CardTitle>

                                      <Badge className={`${getStatusColor(goal.status)} border text-xs px-2 py-1`}>

                                        {goal.status.replace("-", " ")}

                                      </Badge>

                                      <Badge className={`${getPriorityColor(goal.priority)} border text-xs px-2 py-1`}>

                                        {goal.priority}

                                      </Badge>

                                    </div>

                                    <CardDescription className="text-gray-400 text-base leading-relaxed">

                                      {goal.description}

                                    </CardDescription>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">

                                      <span className="flex items-center gap-2">

                                        <Calendar className="w-4 h-4" />

                                        Due: {new Date(goal.targetDate).toLocaleDateString()}

                                      </span>

                                      <span>Category: {goal.category}</span>

                                    </div>

                                  </div>

          

                                  <div className="flex items-center gap-2">

                                    <Dialog

                                      open={isEditDialogOpen && editingGoal?.id === goal.id}

                                      onOpenChange={(open) => {

                                        setIsEditDialogOpen(open)

                                        if (!open) setEditingGoal(null)

                                      }}

                                    >

                                      <DialogTrigger asChild>

                                        <Button

                                          variant="outline"

                                          size="sm"

                                          onClick={() => setEditingGoal(goal)}

                                          className="border-white/20 text-white hover:bg-white/10"

                                        >

                                          <Edit className="w-4 h-4" />

                                        </Button>

                                      </DialogTrigger>

                                      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">

                                        <DialogHeader>

                                          <DialogTitle className="text-xl font-bold text-white">Edit Goal</DialogTitle>

                                        </DialogHeader>

          

                                        {editingGoal && (

                                          <div className="space-y-4">

                                            <div>

                                              <Label htmlFor="edit-title" className="text-white">

                                                Goal Title

                                              </Label>

                                              <Input

                                                id="edit-title"

                                                value={editingGoal.title}

                                                onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}

                                                className="bg-white/10 border-white/20 text-white"

                                              />

                                            </div>

          

                                            <div>

                                              <Label htmlFor="edit-description" className="text-white">

                                                Description

                                              </Label>

                                              <Textarea

                                                id="edit-description"

                                                value={editingGoal.description}

                                                onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}

                                                className="bg-white/10 border-white/20 text-white"

                                              />

                                            </div>

          

                                            <div className="grid grid-cols-2 gap-4">

                                              <div>

                                                <Label htmlFor="edit-category" className="text-white">

                                                  Category

                                                </Label>

                                                <Input

                                                  id="edit-category"

                                                  value={editingGoal.category}

                                                  onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}

                                                  className="bg-white/10 border-white/20 text-white"

                                                />

                                              </div>

          

                                              <div>

                                                <Label htmlFor="edit-targetDate" className="text-white">

                                                  Target Date

                                                </Label>

                                                <Input

                                                  id="edit-targetDate"

                                                  type="date"

                                                  value={editingGoal.targetDate}

                                                  onChange={(e) => setEditingGoal({ ...editingGoal, targetDate: e.target.value })}

                                                  className="bg-white/10 border-white/20 text-white"

                                                />

                                              </div>

                                            </div>

                                          </div>

                                        )}

          

                                        <div className="flex justify-end gap-2 pt-4">

                                          <Button

                                            variant="outline"

                                            onClick={() => setIsEditDialogOpen(false)}

                                            className="border-white/20 text-white hover:bg-white/10"

                                          >

                                            Cancel

                                          </Button>

                                          <Button

                                            onClick={updateGoal}

                                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"

                                          >

                                            Update Goal

                                          </Button>

                                        </div>

                                      </DialogContent>

                                    </Dialog>

          

                                    <Button

                                      variant="outline"

                                      size="sm"

                                      onClick={() => deleteGoal(goal.id)}

                                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"

                                    >

                                      <Trash2 className="w-4 h-4" />

                                    </Button>

                                  </div>

                                </div>

                              </CardHeader>

          

                              <CardContent className="space-y-6">

                                {/* Progress Section */}

                                <div className="space-y-3">

                                  <div className="flex items-center justify-between">

                                    <span className="text-sm font-medium text-white">Progress</span>

                                    <span className="text-sm text-gray-400">{goal.progress}%</span>

                                  </div>

                                  <Progress value={goal.progress} className="h-2 bg-white/10" />

                                </div>

          

                                {/* Milestones */}

                                <div className="space-y-3">

                                  <h4 className="text-sm font-medium text-white">Milestones</h4>

                                  <div className="space-y-2">

                                    {goal.milestones.map((milestone) => (

                                      <div

                                        key={milestone.id}

                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"

                                      >

                                        <Checkbox

                                          checked={milestone.completed}

                                          onCheckedChange={() => toggleMilestone(goal.id, milestone.id)}

                                          className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"

                                        />

                                        <div className="flex-1">

                                          <p

                                            className={`text-sm ${milestone.completed ? "text-gray-400 line-through" : "text-white"}`}

                                          >

                                            {milestone.title}

                                          </p>

                                          <p className="text-xs text-gray-500">

                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}

                                          </p>

                                        </div>

                                      </div>

                                    ))}

                                  </div>

                                </div>

                              </CardContent>

                            </Card>

                          </motion.div>

                        )))}

                      </AnimatePresence>

                    </div>

                  </div>

                </div>

              </div>
  )
}
