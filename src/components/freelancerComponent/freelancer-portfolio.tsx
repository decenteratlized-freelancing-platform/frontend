"use client"

import { useState } from "react"
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
import { Plus, ExternalLink, Github, Eye, Heart, TrendingUp, Upload } from "lucide-react"

interface PortfolioItem {
  id: number
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

const initialPortfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "Modern React-based e-commerce platform with advanced features",
    image: "/placeholder.svg?height=200&width=300&text=E-commerce",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "Web Development",
    views: 1250,
    likes: 89,
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: true,
  },
  {
    id: 2,
    title: "Mobile Banking App",
    description: "Secure and user-friendly mobile banking application",
    image: "/placeholder.svg?height=200&width=300&text=Banking+App",
    technologies: ["React Native", "Firebase", "TypeScript"],
    category: "Mobile Development",
    views: 980,
    likes: 67,
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: false,
  },
  {
    id: 3,
    title: "Task Management Dashboard",
    description: "Comprehensive project management tool with team collaboration",
    image: "/placeholder.svg?height=200&width=300&text=Dashboard",
    technologies: ["Vue.js", "Python", "PostgreSQL"],
    category: "Web Development",
    views: 756,
    likes: 45,
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: true,
  },
  {
    id: 4,
    title: "AI Content Generator",
    description: "Machine learning powered content generation platform",
    image: "/placeholder.svg?height=200&width=300&text=AI+Content",
    technologies: ["Python", "TensorFlow", "FastAPI", "React"],
    category: "AI/ML",
    views: 1100,
    likes: 92,
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: false,
  },
]

const stats = [
  { title: "Total Projects", value: "24", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
  { title: "Total Views", value: "12.5K", icon: Eye, color: "from-green-500 to-emerald-500" },
  { title: "Total Likes", value: "892", icon: Heart, color: "from-pink-500 to-rose-500" },
  { title: "Featured", value: "8", icon: Plus, color: "from-purple-500 to-indigo-500" },
]

export default function FreelancerPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(initialPortfolioItems)
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

  const handleAddProject = () => {
    if (newProject.title && newProject.description && newProject.category) {
      const project: PortfolioItem = {
        id: Date.now(),
        title: newProject.title,
        description: newProject.description,
        image: newProject.image || "/placeholder.svg?height=200&width=300&text=New+Project",
        technologies: newProject.technologies.split(",").map((tech) => tech.trim()),
        category: newProject.category,
        views: 0,
        likes: 0,
        liveUrl: newProject.liveUrl,
        githubUrl: newProject.githubUrl,
        featured: false,
      }
      setPortfolioItems([project, ...portfolioItems])
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
    }
  }

  const filteredItems =
    selectedCategory === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === selectedCategory)

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
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">Portfolio Showcase</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
              My Portfolio
            </span>
          </h1>
          <p className="text-xl text-gray-300">Showcase of my best work and projects</p>
        </div>

        <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl">
              <Plus className="w-5 h-5 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white mb-2 block">
                  Project Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter project title..."
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white mb-2 block">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white mb-2 block">
                    Category *
                  </Label>
                  <Select
                    value={newProject.category}
                    onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="technologies" className="text-white mb-2 block">
                    Technologies
                  </Label>
                  <Input
                    id="technologies"
                    placeholder="React, Node.js, MongoDB (comma separated)"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="liveUrl" className="text-white mb-2 block">
                    Live URL
                  </Label>
                  <Input
                    id="liveUrl"
                    placeholder="https://example.com"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="githubUrl" className="text-white mb-2 block">
                    GitHub URL
                  </Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/username/repo"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image" className="text-white mb-2 block">
                  Project Image
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    placeholder="Image URL or upload"
                    value={newProject.image}
                    onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddProject(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProject}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                  disabled={!newProject.title || !newProject.description || !newProject.category}
                >
                  Add Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={
              selectedCategory === category
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                : "border-white/20 text-white hover:bg-white/10 bg-transparent"
            }
          >
            {category === "all" ? "All Projects" : category}
          </Button>
        ))}
      </motion.div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden group">
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  {item.featured && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.liveUrl && (
                      <Button size="sm" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    {item.githubUrl && (
                      <Button size="sm" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                        <Github className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                    <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.category}
                    </Badge>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="text-xs border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likes}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      View Details
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
