"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Sparkles, Briefcase } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useCurrency } from "@/context/CurrencyContext" // Import useCurrency

export default function PostJobForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currency, toggleCurrency, getConvertedAmount } = useCurrency(); // Use useCurrency

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    budgetType: "",
    budgetAmount: "",
    duration: "",
    experienceLevel: "",
    paymentCurrency: "INR", // Add paymentCurrency to formData
  })

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      toast({ title: "Error", description: "You must be logged in to post a job", variant: "destructive" })
      return
    }

    if (!formData.title || !formData.description || !formData.budgetAmount) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const budget = parseFloat(formData.budgetAmount);
      if (isNaN(budget)) {
        toast({ title: "Error", description: "Invalid budget amount", variant: "destructive" });
        return;
      }
      if (budget <= 0) {
        toast({ title: "Error", description: "Budget amount must be greater than 0", variant: "destructive" });
        return;
      }
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: budget, // Send raw budget amount
          skills: skills,
          email: session.user.email,
          category: formData.category,
          experienceLevel: formData.experienceLevel,
          budgetType: formData.budgetType,
          duration: formData.duration,
          paymentCurrency: formData.paymentCurrency, // Send selected payment currency
        }),
      })

      if (res.ok) {
        toast({ title: "Success", description: "Job posted successfully!" })
        router.push("/client/dashboard")
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to post job", variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label className="text-sm font-medium text-gray-300">Job Title</label>
              <Input
                placeholder="e.g. React Developer for E-commerce Website"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label className="text-sm font-medium text-gray-300">Category</label>
              <Select onValueChange={(val) => setFormData({ ...formData, category: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="mobile-development">Mobile Development</SelectItem>
                  <SelectItem value="design">Design & Creative</SelectItem>
                  <SelectItem value="writing">Writing & Content</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <label className="text-sm font-medium text-gray-300">Job Description</label>
            <Textarea
              placeholder="Describe your project requirements, goals, and expectations..."
              className="min-h-32 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Changed to 3 columns */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="text-sm font-medium text-gray-300">Budget Type</label>
              <Select onValueChange={(val) => setFormData({ ...formData, budgetType: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="text-sm font-medium text-gray-300">Budget Amount</label>
              <Input
                placeholder="e.g. 2500"
                type="number"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
              />
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label className="text-sm font-medium text-gray-300">Payment Currency</label>
              <Select
                onValueChange={(val) => setFormData({ ...formData, paymentCurrency: val })}
                value={formData.paymentCurrency}
                defaultValue="INR"
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label className="text-sm font-medium text-gray-300">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
              <Button
                onClick={addSkill}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200"
                  >
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-300 transition-colors duration-200"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <label className="text-sm font-medium text-gray-300">Project Duration</label>
              <Select onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="less-than-1-month">Less than 1 month</SelectItem>
                  <SelectItem value="1-3-months">1-3 months</SelectItem>
                  <SelectItem value="3-6-months">3-6 months</SelectItem>
                  <SelectItem value="more-than-6-months">More than 6 months</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <label className="text-sm font-medium text-gray-300">Experience Level</label>
              <Select onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div
            className="flex gap-4 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-white px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
            >
              <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl bg-transparent hover:text-white hover:border-blue-400"
            >
              Save as Draft
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

