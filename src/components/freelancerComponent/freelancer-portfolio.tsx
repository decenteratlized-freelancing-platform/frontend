"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, ExternalLink, Github, Eye, Heart, TrendingUp, Upload, Briefcase } from "lucide-react"
import { toast } from "sonner"

interface PortfolioItem {
  id?: string | number
  title: string
  description: string
  image: string
  technologies: string[]
  category: string
  views: number
  likes: number
  liveUrl: string
  githubUrl: string
  featured: boolean
}

const stats = [
  { title: "Total Projects", value: "24", icon: Briefcase, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  { title: "Total Views", value: "12.5K", icon: Eye, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  { title: "Total Likes", value: "892", icon: Heart, color: "text-rose-400", bgColor: "bg-rose-400/10" },
  { title: "Featured", value: "8", icon: TrendingUp, color: "text-amber-400", bgColor: "bg-amber-400/10" },
]

export default function FreelancerPortfolio() {
  const { data: session } = useSession()
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddProject, setShowAddProject] = useState(false)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    technologies: "",
    liveUrl: "",
    githubUrl: "",
    image: "",
  })

  const categories = ["all", "Web Development", "Mobile Development", "AI/ML", "Design"]

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!session?.user?.email) return
      try {
        const res = await fetch(`/api/settings?email=${session.user.email}`)
        if (res.ok) {
          const data = await res.json()
          if (data.profile?.portfolio) {
            const mappedPortfolio = data.profile.portfolio.map((item: any) => ({
              ...item,
              id: item._id,
              technologies: item.technologies || [],
              views: item.views || 0,
              likes: item.likes || 0,
              featured: item.featured || false
            }))
            setPortfolioItems(mappedPortfolio)
          }
        }
      } catch (err) {
        console.error("Failed to fetch portfolio:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [session])

  const handleAddProject = async () => {
    if (newProject.title && newProject.description && newProject.category && session?.user?.email) {
      const project: PortfolioItem = {
        title: newProject.title,
        description: newProject.description,
        image: newProject.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        technologies: newProject.technologies.split(",").map((tech) => tech.trim()).filter(t => t),
        category: newProject.category,
        views: 0,
        likes: 0,
        liveUrl: newProject.liveUrl,
        githubUrl: newProject.githubUrl,
        featured: false,
      }

      const updatedPortfolio = [project, ...portfolioItems]

      try {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            portfolio: updatedPortfolio
          })
        })

        if (res.ok) {
          toast.success("Project added successfully")
          setPortfolioItems(updatedPortfolio)
          setNewProject({
            title: "",
            description: "",
            category: "",
            technologies: "",
            liveUrl: "",
            githubUrl: "",
            image: "",
          })
          setShowAddProject(false)
        } else {
          toast.error("Failed to save project")
        }
      } catch (err) {
        console.error("Save project error:", err)
        toast.error("Something went wrong")
      }
    }
  }

  const filteredItems =
    selectedCategory === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === selectedCategory)

  if (loading) return <div className="p-8 text-center text-white">Loading portfolio...</div>

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between mb-12"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-100">Portfolio Showcase</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            My Portfolio
          </h1>
          <p className="text-lg text-zinc-400">Showcase of my best work and projects</p>
        </div>

        <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
          <DialogTrigger asChild>
            <Button className="bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-6 text-lg font-bold rounded-xl shadow-lg transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="E.g. E-commerce Dashboard"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-300">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Briefly explain what you built..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-zinc-300">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newProject.category}
                    onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technologies" className="text-zinc-300">
                    Technologies
                  </Label>
                  <Input
                    id="technologies"
                    placeholder="React, TypeScript, Tailwind..."
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liveUrl" className="text-zinc-300">
                    Live URL
                  </Label>
                  <Input
                    id="liveUrl"
                    placeholder="https://your-project.com"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-zinc-300">
                    GitHub URL
                  </Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/..."
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-zinc-300">
                  Project Preview Image
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="image"
                    placeholder="Paste image URL here"
                    value={newProject.image}
                    onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 bg-transparent px-3"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddProject(false)}
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  disabled={!newProject.title || !newProject.description || !newProject.category}
                >
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-6 py-2 h-auto text-sm font-semibold transition-all ${
              selectedCategory === category
                ? "bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            {category === "all" ? "All Projects" : category}
          </Button>
        ))}
      </motion.div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all overflow-hidden group h-full flex flex-col shadow-sm">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  {item.featured && (
                    <Badge className="absolute top-4 left-4 bg-amber-500 text-zinc-950 font-bold border-none">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {item.liveUrl && (
                      <Button size="icon" className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full w-10 h-10 shadow-lg" onClick={() => window.open(item.liveUrl, '_blank')}>
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    )}
                    {item.githubUrl && (
                      <Button size="icon" className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full w-10 h-10 shadow-lg" onClick={() => window.open(item.githubUrl, '_blank')}>
                        <Github className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                    <Badge variant="outline" className="border-zinc-800 text-zinc-400 bg-zinc-950 whitespace-nowrap ml-2">
                      {item.category}
                    </Badge>
                  </div>

                  <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.technologies.slice(0, 4).map((tech) => (
                      <Badge
                        key={tech}
                        className="text-[10px] uppercase tracking-wider font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors border-none"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {item.technologies.length > 4 && (
                      <span className="text-[10px] font-bold text-zinc-600">+{item.technologies.length - 4}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-4 text-zinc-500">
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        <Eye className="w-4 h-4" />
                        {item.views}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        <Heart className="w-4 h-4 text-rose-500/50" />
                        {item.likes}
                      </span>
                    </div>
                    <Button
                      variant="link"
                      className="text-white hover:text-blue-400 p-0 h-auto font-bold text-sm"
                    >
                      View Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
