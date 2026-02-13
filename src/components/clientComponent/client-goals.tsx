"use client"

import { useState, useEffect, useCallback } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCurrency } from "@/context/CurrencyContext";
import { 
  Target, Plus, Edit, Trash2, Calendar, CheckCircle, 
  Clock, TrendingUp, FileText, Tag, AlertTriangle, 
  X, Sparkles, Loader2, ListTodo, ChevronRight
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface Milestone {
  id?: string
  _id?: string
  title: string
  completed: boolean
  dueDate: string
}

interface Goal {
  _id: string
  title: string
  description: string
  category: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  progress: number
  deadline: string
  createdAt: string
  milestones: Milestone[]
  priority: "low" | "medium" | "high"
}

export default function ClientGoals() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    deadline: "",
    priority: "medium" as "low" | "medium" | "high",
    milestones: [{ title: "", dueDate: "" }],
  })
  const { getConvertedAmount } = useCurrency();

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/goals`

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    if (session?.user) {
      fetchGoals()
    }
  }, [session, fetchGoals])

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.deadline) {
      toast({ title: "Error", description: "Title and Deadline are required", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newGoal,
          milestones: newGoal.milestones.filter(m => m.title.trim() !== "")
        })
      })

      if (res.ok) {
        toast({ title: "Success", description: "Goal created successfully" })
        fetchGoals()
        setNewGoal({
          title: "",
          description: "",
          category: "",
          deadline: "",
          priority: "medium",
          milestones: [{ title: "", dueDate: "" }],
        })
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create goal", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateGoal = async () => {
    if (!editingGoal) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${apiUrl}/${editingGoal._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingGoal)
      })

      if (res.ok) {
        toast({ title: "Success", description: "Goal updated successfully" })
        fetchGoals()
        setIsEditDialogOpen(false)
        setEditingGoal(null)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update goal", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${apiUrl}/${goalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast({ title: "Success", description: "Goal deleted" })
        setGoals(goals.filter((goal) => goal._id !== goalId))
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete goal", variant: "destructive" })
    }
  }

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map((m) =>
      (m._id === milestoneId || m.id === milestoneId) ? { ...m, completed: !m.completed } : m
    );

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${apiUrl}/${goalId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ milestones: updatedMilestones })
      })

      if (res.ok) {
        const updatedGoal = await res.json();
        setGoals(goals.map(g => g._id === goalId ? updatedGoal : g));
      }
    } catch (error) {
      console.error("Failed to toggle milestone", error);
    }
  }

  const addMilestoneField = () => {
    setNewGoal({
      ...newGoal,
      milestones: [...newGoal.milestones, { title: "", dueDate: "", completed: false }],
    })
  }

  const updateMilestoneField = (index: number, field: "title" | "dueDate", value: string) => {
    const updatedMilestones = newGoal.milestones.map((milestone, i) =>
      i === index ? { ...milestone, [field]: value } : milestone,
    )
    setNewGoal({ ...newGoal, milestones: updatedMilestones })
  }

  const removeMilestoneField = (index: number) => {
    setNewGoal({
      ...newGoal,
      milestones: newGoal.milestones.filter((_, i) => i !== index),
    })
  }

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "overdue":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
  }

  const getPriorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">
                GOALS & <span className="text-indigo-500">OBJECTIVES</span>
              </h1>
              <p className="text-zinc-500 text-lg font-medium">Define your trajectory and track business growth</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-300 scale-105 active:scale-95">
                  <Plus className="w-5 h-5 mr-2 stroke-[3]" />
                  CREATE STRATEGIC GOAL
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl p-0 gap-0 overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="p-8 pb-6 border-b border-zinc-800 bg-zinc-900/20">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Target className="w-6 h-6 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-black text-white tracking-tight">New Strategic Goal</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium">
                          Define a core objective and break it into actionable steps.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                </div>

                <ScrollArea className="max-h-[70vh]">
                  <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                          <FileText className="w-3 h-3 text-indigo-500" />
                          Objective Title
                        </Label>
                        <Input
                          id="title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl py-6 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                          placeholder="e.g., Scale Platform Infrastructure"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                          <ListTodo className="w-3 h-3 text-indigo-500" />
                          Detailed Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl min-h-[100px] focus:ring-indigo-500/20 focus:border-indigo-500/50"
                          placeholder="Describe the desired outcome and impact..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Tag className="w-3 h-3 text-indigo-500" />
                            Category
                          </Label>
                          <Input
                            id="category"
                            value={newGoal.category}
                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                            className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl py-6"
                            placeholder="e.g., Growth"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-indigo-500" />
                            Priority
                          </Label>
                          <Select
                            value={newGoal.priority}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setNewGoal({ ...newGoal, priority: value })
                            }
                          >
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl h-[50px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                              <SelectItem value="low">Low Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="high">High Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-indigo-500 stroke-zinc-100" />
                          Final Deadline
                        </Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl py-6"
                        />
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-4 pt-6 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          Execution Milestones
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addMilestoneField}
                          className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 rounded-xl px-4"
                        >
                          <Plus className="w-3 h-3 mr-1 stroke-[3]" />
                          ADD STEP
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {newGoal.milestones.map((milestone, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-[10px] font-bold mt-1">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input
                                value={milestone.title}
                                onChange={(e) => updateMilestoneField(index, "title", e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl"
                                placeholder="Milestone deliverable..."
                              />
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-zinc-500" />
                                <Input
                                  type="date"
                                  value={milestone.dueDate}
                                  onChange={(e) => updateMilestoneField(index, "dueDate", e.target.value)}
                                  className="bg-zinc-900/30 border-zinc-800 text-zinc-400 text-xs rounded-lg h-8 py-0"
                                />
                              </div>
                            </div>
                            {newGoal.milestones.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMilestoneField(index)}
                                className="text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg mt-1"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-8 border-t border-zinc-800 bg-zinc-900/20 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1 border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 py-6 rounded-2xl font-bold"
                  >
                    DISCARD
                  </Button>
                  <Button
                    onClick={addGoal}
                    disabled={isSubmitting || !newGoal.title}
                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-6 rounded-2xl shadow-xl shadow-white/5 transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        FINALIZE GOAL
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-zinc-900 border-zinc-800 rounded-3xl hover:bg-zinc-900/80 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Target className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{goals.length}</p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Total Goals</p>
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
              <Card className="bg-zinc-900 border-zinc-800 rounded-3xl hover:bg-zinc-900/80 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white leading-none">
                        {goals.filter((g) => g.status === "completed").length}
                      </p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Completed</p>
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
              <Card className="bg-zinc-900 border-zinc-800 rounded-3xl hover:bg-zinc-900/80 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-600/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white leading-none">
                        {goals.filter((g) => g.status === "in-progress").length}
                      </p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Active</p>
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
              <Card className="bg-zinc-900 border-zinc-800 rounded-3xl hover:bg-zinc-900/80 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white leading-none">
                        {goals.length === 0 ? 0 : Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
                      </p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Engagement</p>
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-20 bg-zinc-900 border border-zinc-800 border-dashed rounded-[3rem] text-center"
                >
                  <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-zinc-600" />
                  </div>
                  <p className="text-2xl font-black text-white mb-2 uppercase tracking-tight">No Active Trajectories</p>
                  <p className="text-zinc-500 max-w-sm mx-auto font-medium">Your strategic goals ledger is currently empty. Define a new objective to begin tracking progress.</p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    variant="outline" 
                    className="mt-8 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
                  >
                    Start Your First Goal
                  </Button>
                </motion.div>
              ) : (
                goals.map((goal, index) => (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-xl group">
                      <CardHeader className="p-8 pb-4">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge className={`${getStatusColor(goal.status)} px-3 py-1 font-bold text-[10px] uppercase tracking-widest border`}>
                                {goal.status.replace("-", " ")}
                              </Badge>
                              <Badge className={`${getPriorityColor(goal.priority)} px-3 py-1 font-bold text-[10px] uppercase tracking-widest border`}>
                                {goal.priority}
                              </Badge>
                              <div className="h-4 w-px bg-zinc-800 mx-1" />
                              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">#{goal._id.slice(-6)}</span>
                            </div>
                            
                            <div>
                              <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{goal.title}</CardTitle>
                              <CardDescription className="text-zinc-400 text-base leading-relaxed line-clamp-2">
                                {goal.description}
                              </CardDescription>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-2 text-zinc-500">
                                <Calendar className="w-4 h-4 text-zinc-100" />
                                <span className="text-zinc-400">Due:</span> {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-2 text-zinc-500">
                                <Tag className="w-4 h-4 text-indigo-500" />
                                <span className="text-zinc-400">Category:</span> {goal.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Dialog
                              open={isEditDialogOpen && editingGoal?._id === goal._id}
                              onOpenChange={(open) => {
                                setIsEditDialogOpen(open)
                                if (!open) setEditingGoal(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setEditingGoal({ ...goal })}
                                  className="w-12 h-12 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-2xl transition-all"
                                >
                                  <Edit className="w-5 h-5 stroke-[2.5]" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl p-0 gap-0 overflow-hidden rounded-[2rem]">
                                <div className="p-8 pb-6 border-b border-zinc-800 bg-zinc-900/20">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-white tracking-tight">Modify Goal Parameters</DialogTitle>
                                  </DialogHeader>
                                </div>

                                {editingGoal && (
                                  <ScrollArea className="max-h-[60vh]">
                                    <div className="p-8 space-y-6">
                                      <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Objective Title</Label>
                                        <Input
                                          value={editingGoal.title}
                                          onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                                          className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl py-6"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</Label>
                                        <Textarea
                                          value={editingGoal.description}
                                          onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                                          className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl min-h-[100px]"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</Label>
                                          <Input
                                            value={editingGoal.category}
                                            onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                                            className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl py-6"
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target Date</Label>
                                          <Input
                                            type="date"
                                            value={editingGoal.deadline ? new Date(editingGoal.deadline).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                                            className="bg-zinc-900/50 border-zinc-800 text-white rounded-xl py-6"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                )}

                                <div className="p-8 border-t border-zinc-800 bg-zinc-900/20 flex gap-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="flex-1 border-zinc-800 bg-zinc-900 text-zinc-400 py-6 rounded-2xl"
                                  >
                                    CANCEL
                                  </Button>
                                  <Button
                                    onClick={updateGoal}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-6 rounded-2xl transition-all shadow-xl"
                                  >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "SAVE CHANGES"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteGoal(goal._id)}
                              className="w-12 h-12 border-zinc-800 bg-zinc-900/50 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                            >
                              <Trash2 className="w-5 h-5 stroke-[2.5]" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-8 space-y-8">
                        {/* Progress Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Completion Velocity</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                              <span className="text-xl font-black text-white">{goal.progress}%</span>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress value={goal.progress} className="h-3 bg-zinc-800 rounded-full overflow-hidden" />
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full opacity-50 blur-sm -z-10" 
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Milestones */}
                        <div className="space-y-4 pt-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
                            <ListTodo className="w-3 h-3" />
                            Tactical Steps ({goal.milestones.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goal.milestones.map((milestone) => (
                              <motion.div
                                key={milestone._id || milestone.id}
                                whileHover={{ scale: 1.02 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                                  milestone.completed 
                                    ? "bg-emerald-500/5 border-emerald-500/20" 
                                    : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                                }`}
                                onClick={() => toggleMilestone(goal._id, (milestone._id || milestone.id)!)}
                              >
                                <Checkbox
                                  checked={milestone.completed}
                                  className={`w-6 h-6 rounded-lg border-zinc-700 transition-all ${
                                    milestone.completed 
                                      ? "bg-emerald-500 border-emerald-500 text-white" 
                                      : "bg-zinc-900"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold truncate ${milestone.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                                    {milestone.title}
                                  </p>
                                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">
                                    Target: {new Date(milestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 ${milestone.completed ? "text-emerald-500/50" : "text-zinc-800"}`} />
                              </motion.div>
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
