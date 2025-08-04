"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  MapPin,
  Heart,
  Star,
  Users,
  Calendar,
  Send,
  Briefcase,
  Award,
  CheckCircle,
} from "lucide-react"

const jobs = [
  {
    id: 1,
    title: "Full-Stack React Developer for E-commerce Platform",
    client: "TechStartup Inc.",
    clientRating: 4.9,
    clientReviews: 127,
    budget: 3500,
    budgetType: "Fixed Price",
    duration: "2-3 months",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
    description:
      "We're looking for an experienced full-stack developer to build a modern e-commerce platform with React frontend and Node.js backend. The project includes payment integration, inventory management, and admin dashboard.",
    posted: "2 hours ago",
    proposals: 8,
    location: "Remote",
    category: "Web Development",
    experience: "Expert",
    verified: true,
    urgent: false,
    featured: true,
  },
  {
    id: 2,
    title: "UI/UX Designer for Mobile Banking App",
    client: "FinanceCorpXYZ",
    clientRating: 4.7,
    clientReviews: 89,
    budget: 2200,
    budgetType: "Fixed Price",
    duration: "1-2 months",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Mobile Design"],
    description:
      "Design a user-friendly mobile banking application with modern UI/UX principles and accessibility standards. Must include wireframes, prototypes, and design system.",
    posted: "5 hours ago",
    proposals: 12,
    location: "Remote",
    category: "Design",
    experience: "Intermediate",
    verified: true,
    urgent: true,
    featured: false,
  },
  {
    id: 3,
    title: "Python Data Scientist for ML Project",
    client: "DataTech Solutions",
    clientRating: 4.8,
    clientReviews: 156,
    budget: 45,
    budgetType: "Hourly",
    duration: "3-6 months",
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "Data Visualization"],
    description:
      "Develop machine learning models for predictive analytics and data visualization dashboards. Experience with large datasets and cloud platforms required.",
    posted: "1 day ago",
    proposals: 15,
    location: "Remote",
    category: "Data Science",
    experience: "Expert",
    verified: true,
    urgent: false,
    featured: false,
  },
  {
    id: 4,
    title: "Content Writer for Tech Blog",
    client: "BlogMaster Co.",
    clientRating: 4.5,
    clientReviews: 43,
    budget: 800,
    budgetType: "Fixed Price",
    duration: "Less than 1 month",
    skills: ["Content Writing", "SEO", "Technical Writing", "Research"],
    description:
      "Create engaging technical blog posts about web development, AI, and emerging technologies. Must have experience in tech writing and SEO optimization.",
    posted: "3 days ago",
    proposals: 25,
    location: "Remote",
    category: "Writing",
    experience: "Intermediate",
    verified: false,
    urgent: false,
    featured: false,
  },
  {
    id: 5,
    title: "React Native Mobile App Developer",
    client: "StartupHub",
    clientRating: 4.9,
    clientReviews: 201,
    budget: 5000,
    budgetType: "Fixed Price",
    duration: "2-4 months",
    skills: ["React Native", "JavaScript", "Firebase", "Redux", "API Integration"],
    description:
      "Build a cross-platform mobile application for social networking. Features include real-time messaging, media sharing, and user profiles.",
    posted: "6 hours ago",
    proposals: 6,
    location: "Remote",
    category: "Mobile Development",
    experience: "Expert",
    verified: true,
    urgent: true,
    featured: true,
  },
]

export default function BrowseJobs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedExperience, setSelectedExperience] = useState("all")
  const [budgetRange, setBudgetRange] = useState([0, 10000])
  const [budgetType, setBudgetType] = useState("all")
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [proposalText, setProposalText] = useState("")
  const [proposalBudget, setProposalBudget] = useState("")
  const [proposalDelivery, setProposalDelivery] = useState("")
  const [showProposalDialog, setShowProposalDialog] = useState(false)
  const [submittedProposals, setSubmittedProposals] = useState<number[]>([])

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const handleSubmitProposal = () => {
    if (selectedJob && proposalText && proposalBudget && proposalDelivery) {
      setSubmittedProposals((prev) => [...prev, selectedJob.id])
      setShowProposalDialog(false)
      setProposalText("")
      setProposalBudget("")
      setProposalDelivery("")
      // Show success message or redirect
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory
    const matchesExperience = selectedExperience === "all" || job.experience === selectedExperience
    const matchesBudgetType = budgetType === "all" || job.budgetType === budgetType
    const matchesBudget = job.budget >= budgetRange[0] && job.budget <= budgetRange[1]
    const matchesVerified = !showVerifiedOnly || job.verified
    const matchesUrgent = !showUrgentOnly || job.urgent

    return (
      matchesSearch &&
      matchesCategory &&
      matchesExperience &&
      matchesBudgetType &&
      matchesBudget &&
      matchesVerified &&
      matchesUrgent
    )
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "budget-high":
        return b.budget - a.budget
      case "budget-low":
        return a.budget - b.budget
      case "proposals":
        return a.proposals - b.proposals
      case "rating":
        return b.clientRating - a.clientRating
      default:
        return 0 // newest (default order)
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <Briefcase className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Job Marketplace</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Browse Jobs</span>
        </h1>
        <p className="text-xl text-gray-300">Find your next opportunity from {jobs.length} available projects</p>
      </motion.div>

      {/* Advanced Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
          <CardContent className="pt-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search jobs, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-lg"
                />
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 px-8">
                <Search className="w-5 h-5 mr-2" />
                Search Jobs
              </Button>
            </div>

            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Writing">Writing</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={budgetType} onValueChange={setBudgetType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Budget Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="budget-high">Highest Budget</SelectItem>
                  <SelectItem value="budget-low">Lowest Budget</SelectItem>
                  <SelectItem value="proposals">Fewest Proposals</SelectItem>
                  <SelectItem value="rating">Highest Rated Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Row 2 */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={showVerifiedOnly}
                  onCheckedChange={setShowVerifiedOnly}
                  className="border-white/20"
                />
                <Label htmlFor="verified" className="text-white">
                  Verified Clients Only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={showUrgentOnly}
                  onCheckedChange={setShowUrgentOnly}
                  className="border-white/20"
                />
                <Label htmlFor="urgent" className="text-white">
                  Urgent Jobs Only
                </Label>
              </div>

              <div className="flex items-center gap-4 flex-1 min-w-64">
                <Label className="text-white whitespace-nowrap">Budget Range:</Label>
                <div className="flex-1">
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>${budgetRange[0]}</span>
                    <span>${budgetRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <p className="text-gray-300">
          Showing <span className="text-white font-semibold">{sortedJobs.length}</span> of{" "}
          <span className="text-white font-semibold">{jobs.length}</span> jobs
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </motion.div>

      {/* Job Listings */}
      <div className="space-y-6">
        <AnimatePresence>
          {sortedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.01 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-300 overflow-hidden">
                <CardContent className="pt-6">
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white hover:text-green-300 transition-colors cursor-pointer">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {job.featured && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {job.urgent && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Urgent</Badge>
                          )}
                          {job.verified && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <div>
                            <span className="font-semibold text-white">
                              ${job.budgetType === "Hourly" ? `${job.budget}/hr` : job.budget.toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-400">{job.budgetType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="font-semibold text-white">{job.duration}</span>
                            <p className="text-xs text-gray-400">Duration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="font-semibold text-white">{job.location}</span>
                            <p className="text-xs text-gray-400">Location</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <div>
                            <span className="font-semibold text-white">{job.experience}</span>
                            <p className="text-xs text-gray-400">Level</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaveJob(job.id)}
                      className={`${
                        savedJobs.includes(job.id)
                          ? "text-red-400 hover:text-red-300"
                          : "text-gray-400 hover:text-white"
                      } hover:bg-white/10`}
                    >
                      <Heart className={`w-5 h-5 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {/* Client Info & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {job.client
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{job.client}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{job.clientRating}</span>
                            <span className="text-gray-400">({job.clientReviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {job.posted}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.proposals} proposals
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {submittedProposals.includes(job.id) ? (
                        <Button disabled className="bg-green-600/50 text-white">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Proposal Sent
                        </Button>
                      ) : (
                        <Dialog
                          open={showProposalDialog && selectedJob?.id === job.id}
                          onOpenChange={setShowProposalDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                              onClick={() => setSelectedJob(job)}
                            >
                              Submit Proposal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">Submit Proposal</DialogTitle>
                              <p className="text-gray-400">{job.title}</p>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <Label htmlFor="proposal" className="text-white mb-2 block">
                                  Cover Letter *
                                </Label>
                                <Textarea
                                  id="proposal"
                                  placeholder="Describe your approach to this project..."
                                  value={proposalText}
                                  onChange={(e) => setProposalText(e.target.value)}
                                  className="min-h-32 bg-white/5 border-white/10 text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="budget" className="text-white mb-2 block">
                                    Your Rate *
                                  </Label>
                                  <Input
                                    id="budget"
                                    placeholder={job.budgetType === "Hourly" ? "$/hour" : "Total amount"}
                                    value={proposalBudget}
                                    onChange={(e) => setProposalBudget(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="delivery" className="text-white mb-2 block">
                                    Delivery Time *
                                  </Label>
                                  <Input
                                    id="delivery"
                                    placeholder="e.g., 2 weeks"
                                    value={proposalDelivery}
                                    onChange={(e) => setProposalDelivery(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowProposalDialog(false)}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSubmitProposal}
                                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                  disabled={!proposalText || !proposalBudget || !proposalDelivery}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Proposal
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {sortedJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent px-8 py-3">
            Load More Jobs
          </Button>
        </motion.div>
      )}
    </div>
  )
}
