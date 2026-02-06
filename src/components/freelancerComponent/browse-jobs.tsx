"use client";
import {
  Search,
  Filter,
  Clock,
  Wallet,
  MapPin,
  Heart,
  Star,
  Users,
  Send,
  Briefcase,
  CheckCircle,
  Tag,
  Loader2,
  ChevronDown
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast";
import { JobDetailsModal } from "../shared/job-details-modal";
import { ProposalSubmitModal } from "../shared/proposal-submit-modal";
import { useCurrency } from "@/context/CurrencyContext";

const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-development", label: "Web Development" },
    { value: "mobile-development", label: "Mobile Development" },
    { value: "design", label: "Design & Creative" },
    { value: "writing", label: "Writing & Content" },
    { value: "marketing", label: "Marketing" },
    { value: "data-science", label: "Data Science" },
];

const experienceLevels = [
    { value: "all", label: "All Levels" },
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
];

export default function BrowseJobs() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedExperience, setSelectedExperience] = useState("all")
  const [budgetTypeFilter, setBudgetType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showProposalDialog, setShowProposalDialog] = useState(false)
  const [submittedProposals, setSubmittedProposals] = useState<string[]>([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
    fetchJobs()
    fetchSavedJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedJobs = async () => {
    try {
        const token = await ensureToken();
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            setSavedJobs(data.jobs.map((j: any) => j._id))
        }
    } catch (error) {
        console.error("Error fetching saved jobs:", error)
    }
  }

  const toggleSaveJob = async (jobId: string) => {
    const isSaved = savedJobs.includes(jobId)
    const token = await ensureToken();
    if (!token) {
        toast({ title: "Auth Required", description: "Please log in to save jobs.", variant: "destructive" })
        return
    }

    try {
        const endpoint = isSaved ? "/api/user/favorites/jobs/remove" : "/api/user/favorites/jobs/add"
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ jobId })
        })

        if (res.ok) {
            setSavedJobs(prev => isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId])
            toast({ title: isSaved ? "Removed" : "Saved", description: isSaved ? "Job removed from favorites" : "Job saved to favorites" })
        }
    } catch (error) {
        console.error("Error toggling favorite:", error)
    }
  }

  const handleProposalSuccess = (jobId: string) => {
    setSubmittedProposals((prev) => [...prev, jobId])
    fetchJobs()
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills && job.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory
    const matchesExperience = selectedExperience === "all" || job.experienceLevel === selectedExperience
    const matchesBudgetType = budgetTypeFilter === "all" || job.budgetType === budgetTypeFilter

    return matchesSearch && matchesCategory && matchesExperience && matchesBudgetType
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "budget-high":
        return parseFloat(b.budget) - parseFloat(a.budget)
      case "budget-low":
        return parseFloat(a.budget) - parseFloat(b.budget)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-zinc-300">Marketplace</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Opportunity</span>
        </h1>
        <p className="text-zinc-400 max-w-xl">Explore projects from top clients and start your journey with SmartHire.</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-10 space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by role, tech stack, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-11 pr-4 py-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all text-sm h-14"
            />
          </div>
          <div className="flex gap-2">
            <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className={`border-zinc-800 rounded-2xl px-6 h-14 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${showFilters ? "bg-zinc-800 text-white border-zinc-600" : "bg-zinc-900"}`}
            >
              <Filter className="w-4 h-4" /> {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button className="bg-white hover:bg-zinc-200 text-zinc-950 px-8 h-14 rounded-2xl font-bold transition-all shadow-xl shadow-white/5 whitespace-nowrap">
              Search Jobs
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
            {showFilters && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Experience</label>
                            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {experienceLevels.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Budget Type</label>
                            <Select value={budgetTypeFilter} onValueChange={setBudgetType}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="fixed">Fixed Price</SelectItem>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sort By</label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                                    <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {sortedJobs.length > 0 ? sortedJobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                            New Project
                          </Badge>
                          <span className="text-zinc-600 text-xs font-medium">#{job._id.slice(-6)}</span>
                        </div>
                        <button
                          onClick={() => toggleSaveJob(job._id)}
                          className={`p-2 rounded-xl transition-colors ${
                            savedJobs.includes(job._id) ? "bg-pink-500/10 text-pink-500" : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${savedJobs.includes(job._id) ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-3 leading-tight">
                        {job.title}
                      </h3>
                      
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2 max-w-3xl">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {job.skills && job.skills.map((skill: string) => (
                          <div key={skill} className="bg-zinc-950 text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-zinc-800">
                            {skill}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                            <Tag className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-white">
                              {getConvertedAmount(job.budget)}
                            </span>
                            <p className="text-xs text-gray-400">Budget</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                            <Clock className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Posted On</p>
                            <p className="text-white font-bold text-base">{new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                            <Users className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Applications</p>
                            <p className="text-white font-bold text-base">{job.proposalsCount || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-64 flex flex-col justify-between pt-4 lg:pt-0">
                      <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Client Integrity</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-bold text-sm border border-zinc-700">
                            {job.client?.fullName?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm truncate">{job.client?.fullName || 'Verified Client'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-[10px] font-bold text-zinc-400">4.9/5.0</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        <Button
                          variant="ghost"
                          className="w-full h-12 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold text-xs uppercase tracking-widest border border-transparent hover:border-zinc-700"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          Details
                        </Button>
                        
                        {submittedProposals.includes(job._id) ? (
                          <Button disabled className="w-full h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest">
                            <CheckCircle className="w-4 h-4 mr-2" /> Applied
                          </Button>
                        ) : (
                          <Button
                            className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-white/5"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowProposalDialog(true);
                            }}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No jobs match your search criteria.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <ProposalSubmitModal 
        job={selectedJob}
        isOpen={showProposalDialog}
        onClose={() => setShowProposalDialog(false)}
        onSuccess={handleProposalSuccess}
        userEmail={session?.user?.email}
        walletAddress={session?.user?.walletAddress || undefined}
      />
      <JobDetailsModal
        job={selectedJob}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  )
}
