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
import { useCurrency } from "@/context/CurrencyContext";
import { Target, Plus, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2, TrendingUp, Trophy, Sparkles } from 'lucide-react'

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
    title: "Earn 10 ETH This Year",
    description: "Reach annual income target through high-value blockchain projects",
    progress: 75,
    target: 10,
    current: 7.5,
    deadline: "2024-12-31",
    status: "in-progress",
    category: "Financial",
  },
  {
    id: 2,
    title: "Complete 25 Projects",
    description: "Deliver high-quality results to build a verified reputation",
    progress: 68,
    target: 25,
    current: 17,
    deadline: "2024-12-31",
    status: "in-progress",
    category: "Professional",
  },
  {
    id: 3,
    title: "Master Smart Contracts",
    description: "Learn advanced Solidity patterns and security audits",
    progress: 40,
    target: 100,
    current: 40,
    deadline: "2024-06-30",
    status: "in-progress",
    category: "Skill Development",
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
  const { getConvertedAmount } = useCurrency();

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.target && newGoal.deadline && newGoal.category) {
      const targetValue = Number.parseFloat(newGoal.target);
      if (targetValue <= 0) {
        // You might want to add a toast here if available, or just return
        alert("Target value must be greater than 0"); 
        return;
      }

      const goal: Goal = {
        id: Date.now(),
        title: newGoal.title,
        description: newGoal.description,
        progress: 0,
        target: targetValue,
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
            current: parseFloat(((newProgress / 100) * goal.target).toFixed(4)),
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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "overdue":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
  }

  const completedGoals = goals.filter((g) => g.status === "completed").length
  const averageProgress = goals.length === 0 ? 0 : Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-950 min-h-screen text-zinc-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-2.5 mb-6">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-zinc-300">Milestone Tracker</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">Goals</span>
            </h1>
            <p className="text-zinc-400 max-w-xl">Architect your career path and track progress towards your professional milestones.</p>
          </div>
          <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
            <DialogTrigger asChild>
              <Button className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-8 py-6 rounded-2xl transition-all shadow-xl shadow-white/5">
                <Plus className="w-5 h-5 mr-2" />
                Define New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Objective</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Reach 100 Verified Reviews"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white focus:ring-blue-500/20 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Brief Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does success look like for this goal?"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white focus:ring-blue-500/20 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Category</Label>
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-12">
                        <SelectValue placeholder="Select path" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Skill Development">Skill Development</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      min="0"
                      placeholder="Numerical target..."
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-white h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddGoal(false)}
                    className="text-zinc-500 hover:text-white hover:bg-zinc-900"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleAddGoal}
                    className="bg-white text-zinc-950 font-bold px-8 hover:bg-zinc-200"
                    disabled={!newGoal.title || !newGoal.target || !newGoal.deadline}
                  >
                    Activate Goal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {[
          { label: "Completed", value: completedGoals, icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/5" },
          { label: "In Progress", value: goals.length - completedGoals, icon: Target, color: "text-blue-400", bg: "bg-blue-500/5" },
          { label: "Avg. Progress", value: `${averageProgress}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/5" },
        ].map((stat, i) => (
          <Card key={i} className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/60 transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-2 flex flex-col items-center justify-center p-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl text-center"
            >
              <Target className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium">Your goal board is currently empty.</p>
            </motion.div>
          ) : (
            goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all duration-300 h-full group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-none ${getStatusColor(goal.status)}`}>
                            {goal.status}
                          </Badge>
                          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{goal.category}</span>
                        </div>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {goal.title}
                        </CardTitle>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                        {goal.category === 'Financial' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <Target className="w-5 h-5 text-blue-500" />}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{goal.description}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Progress</span>
                        <span className="text-sm font-bold text-white">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1.5 bg-zinc-950" />
                      <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-1">
                        <span>{goal.category === "Financial" ? getConvertedAmount(goal.current) : goal.current}</span>
                        <span>{goal.category === "Financial" ? getConvertedAmount(goal.target) : goal.target}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Ends {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openProgressDialog(goal)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(goal)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Track Progress</DialogTitle>
          </DialogHeader>
          {selectedGoalForProgress && (
            <div className="space-y-8 py-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Completion Status</Label>
                  <span className="text-blue-400 font-bold text-lg">{selectedGoalForProgress.progress}%</span>
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
                  className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Current Achievement</span>
                  <span className="text-white font-bold">{selectedGoalForProgress.category === 'Financial' ? getConvertedAmount(selectedGoalForProgress.current) : selectedGoalForProgress.current}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Target Milestone</span>
                  <span className="text-zinc-400">{selectedGoalForProgress.category === 'Financial' ? getConvertedAmount(selectedGoalForProgress.target) : selectedGoalForProgress.target}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowProgressDialog(false)}
                className="w-full bg-white text-zinc-950 font-bold py-6 rounded-2xl hover:bg-zinc-200"
              >
                Confirm Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
