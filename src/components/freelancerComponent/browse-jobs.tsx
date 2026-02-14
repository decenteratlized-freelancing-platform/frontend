"use client";
import {
  Search,
  Filter,
  Briefcase,
  Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { JobCard } from "../shared/job-card";
import { useSearchParams } from "next/navigation";

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

function BrowseJobsContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams();
  const applyId = searchParams.get("apply");
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedExperience, setSelectedExperience] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showProposalDialog, setShowProposalDialog] = useState(false)
  const [submittedProposals, setSubmittedProposals] = useState<string[]>([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { getConvertedAmount } = useCurrency();

  const ensureToken = useCallback(async () => {
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
  }, [session]);

  const fetchJobs = useCallback(async () => {
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
  }, [])

  const fetchSavedJobs = useCallback(async () => {
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
  }, [ensureToken])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    if (applyId && jobs.length > 0) {
      const jobToApply = jobs.find(j => j._id === applyId);
      if (jobToApply) {
        setSelectedJob(jobToApply);
        setShowProposalDialog(true);
      }
    }
  }, [applyId, jobs]);

  useEffect(() => {
    if (session?.user) {
        fetchSavedJobs()
    }
  }, [session, fetchSavedJobs])

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

    return matchesSearch && matchesCategory && matchesExperience
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
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all text-sm h-14"
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

                        <div className="flex flex-col justify-end">
                            <Button 
                                variant="ghost" 
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("all");
                                    setSelectedExperience("all");
                                    setSortBy("newest");
                                }}
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-10 rounded-xl text-xs uppercase font-bold tracking-widest transition-all"
                            >
                                Reset Filters
                            </Button>
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
            <JobCard
              key={job._id}
              job={job}
              variant="freelancer"
              isSaved={savedJobs.includes(job._id)}
              onSave={toggleSaveJob}
              onViewDetails={(j) => {
                setSelectedJob(j);
                setIsDetailsModalOpen(true);
              }}
              onApply={(j) => {
                setSelectedJob(j);
                setShowProposalDialog(true);
              }}
              hasApplied={submittedProposals.includes(job._id)}
            />
          )) : (
            <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
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
        onApply={(j) => {
          setSelectedJob(j);
          setShowProposalDialog(true);
        }}
      />
    </div>
  )
}

export default function BrowseJobs() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-zinc-950"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <BrowseJobsContent />
        </Suspense>
    )
}
