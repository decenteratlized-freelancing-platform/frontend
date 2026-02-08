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
import { useCurrency } from "@/context/CurrencyContext"

// Common skills list for autocomplete
const availableSkills = [
  "React", "Node.js", "TypeScript", "JavaScript", "Python", "Java", "C++", "C#",
  "PHP", "Ruby", "Go", "Swift", "Kotlin", "Dart", "Rust", "HTML/CSS",
  "Vue.js", "Angular", "Next.js", "Express.js", "Django", "Flask", "Laravel",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
  "AWS", "Docker", "Kubernetes", "Git", "CI/CD", "DevOps",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "Machine Learning", "Data Science", "Blockchain", "Web3", "Solidity",
  "Mobile Development", "iOS", "Android", "React Native", "Flutter",
  "Content Writing", "Copywriting", "SEO", "Digital Marketing", "Social Media",
  "Smart Contracts", "DeFi", "NFTs", "Cybersecurity", "Cloud Computing"
];

// Expanded categories
const categories = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design & Creative" },
  { value: "writing", label: "Writing & Content" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" },
  { value: "blockchain", label: "Blockchain & Web3" },
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "cloud-computing", label: "Cloud Computing" },
  { value: "devops", label: "DevOps & Infrastructure" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "legal", label: "Legal Services" },
  { value: "admin-support", label: "Admin Support" },
  { value: "customer-service", label: "Customer Service" },
];

export default function PostJobForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const { getConvertedAmount } = useCurrency();

  const ensureToken = async () => {
    let token = localStorage.getItem("token");
    if (!token && session?.user?.email) {
        try {
            const devRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/dev-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email })
            });
            if (devRes.ok) {
                const data = await devRes.json();
                token = data.token;
                localStorage.setItem("token", token || "");
            }
        } catch (e) { console.error("Auto-token failed", e); }
    }
    return token;
  };

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    budgetAmount: "",
    duration: "",
    paymentMode: "hourly",
    paymentCurrency: "ETH",
    experienceLevel: "intermediate",
  })

  const addSkill = (skillToAdd: string = newSkill) => {
    if (skillToAdd.trim() && !skills.includes(skillToAdd.trim())) {
      setSkills([...skills, skillToAdd.trim()])
      setNewSkill("")
      setShowSkillSuggestions(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSaveDraft = async () => {
    if (!session?.user?.email) {
      toast({ title: "Error", description: "You must be logged in to save a draft", variant: "destructive" })
      return
    }

    if (!formData.title) {
        toast({ title: "Error", description: "Job title is required to save a draft", variant: "destructive" })
        return
    }

    setIsSubmitting(true)
    try {
        const budget = parseFloat(formData.budgetAmount) || 0;
        const token = await ensureToken();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                title: formData.title,
                description: formData.description || "Draft Description", // Allow partial data for draft
                budget: budget,
                skills: skills,
                email: session.user.email,
                category: formData.category,
                experienceLevel: formData.experienceLevel,
                duration: formData.duration,
                paymentCurrency: formData.paymentCurrency,
                status: "draft" // Explicitly set status to draft
            }),
        })

        if (res.ok) {
            toast({ title: "Success", description: "Job saved as draft!" })
            router.push("/client/dashboard")
        } else {
            const error = await res.json()
            toast({ title: "Error", description: error.error || "Failed to save draft", variant: "destructive" })
        }
    } catch (err) {
        console.error(err)
        toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
        setIsSubmitting(false)
    }
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
      const token = await ensureToken();
      if (isNaN(budget)) {
        toast({ title: "Error", description: "Invalid budget amount", variant: "destructive" });
        return;
      }
      if (budget <= 0) {
        toast({ title: "Error", description: "Budget amount must be greater than 0", variant: "destructive" });
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: budget,
          skills: skills,
          email: session.user.email,
          category: formData.category,
          experienceLevel: formData.experienceLevel,
          duration: formData.duration,
          paymentCurrency: formData.paymentCurrency,
          status: "open" // Default to open for published jobs
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
                <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="text-sm font-medium text-gray-300">Fixed Price (ETH)</label>
              <Input
                placeholder="e.g. 2.5"
                type="number"
                min="0"
                step="0.01"
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
                defaultValue="ETH"
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="ETH">Ξ ETH</SelectItem>
                  </SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div
            className="space-y-2 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label className="text-sm font-medium text-gray-300">Required Skills</label>
            <div className="flex gap-2 mb-2 relative">
              <div className="relative w-full">
                <Input
                  placeholder="Type to search skills..."
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    setShowSkillSuggestions(true);
                  }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20 w-full"
                />
                
                {/* Autocomplete Suggestions */}
                {showSkillSuggestions && newSkill && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {availableSkills
                      .filter(skill => 
                        skill.toLowerCase().includes(newSkill.toLowerCase()) && 
                        !skills.includes(skill)
                      )
                      .map((skill) => (
                        <div
                          key={skill}
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </div>
                      ))
                    }
                    {availableSkills.filter(skill => skill.toLowerCase().includes(newSkill.toLowerCase())).length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-400">No matching skills found. Press Enter to add custom skill.</div>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={() => addSkill()}
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
              onClick={handleSaveDraft}
              variant="outline"
              disabled={isSubmitting}
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl bg-transparent hover:text-white hover:border-blue-400"
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}