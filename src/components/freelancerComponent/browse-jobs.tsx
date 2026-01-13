"use client";
import {
  Search,
  Filter,
  Clock,
  IndianRupee,
  MapPin,
  Heart,
  Star,
  Users,
  Calendar,
  Send,
  Briefcase,
  Award,
  CheckCircle,
  Tag
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { JobDetailsModal } from "../shared/job-details-modal";

export default function BrowseJobs() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
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
  const [submittedProposals, setSubmittedProposals] = useState<string[]>([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs")
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

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const handleSubmitProposal = async () => {
    if (!session?.user?.email) {
      toast({ title: "Error", description: "You must be logged in to submit a proposal", variant: "destructive" })
      return
    }

    if (selectedJob?.paymentCurrency === 'ETH' && !session?.user?.walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to apply for ETH-based jobs.",
        variant: "destructive",
      });
      return;
    } else if (selectedJob?.paymentCurrency === 'INR' && !session?.user?.bankAccount) {
        toast({
            title: "Bank Account Required",
            description: "Please add your bank details to apply for INR-based jobs.",
            variant: "destructive",
        });
        return;
    }

    if (selectedJob && proposalText && proposalBudget && proposalDelivery) {
      try {
        const res = await fetch("http://localhost:5000/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: selectedJob._id,
            email: session.user.email,
            coverLetter: proposalText,
            proposedRate: parseFloat(proposalBudget),
            deliveryTime: proposalDelivery,
          }),
        })

        if (res.ok) {
          setSubmittedProposals((prev) => [...prev, selectedJob._id])
          setShowProposalDialog(false)
          setProposalText("")
          setProposalBudget("")
          setProposalDelivery("")
          toast({ title: "Success", description: "Proposal submitted successfully!" })
        } else {
          const error = await res.json()
          toast({ title: "Error", description: error.error || "Failed to submit proposal", variant: "destructive" })
        }
      } catch (error) {
        console.error("Error submitting proposal:", error)
        toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
      }
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills && job.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory
    const matchesExperience = selectedExperience === "all" || job.experienceLevel === selectedExperience
    const matchesBudgetType = budgetType === "all" || job.budgetType === budgetType
    // const matchesVerified = !showVerifiedOnly || job.client.isVerified // Assuming isVerified exists on client
    // const matchesUrgent = !showUrgentOnly || job.isUrgent // Assuming isUrgent exists

    return matchesSearch && matchesCategory && matchesExperience && matchesBudgetType
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "budget-high":
        return b.budget - a.budget
      case "budget-low":
        return a.budget - b.budget
      // case "proposals": return a.proposalsCount - b.proposalsCount // If I added this field
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  if (loading) {
    return <div className="text-white text-center py-20">Loading jobs...</div>
  }

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
          <span className="text-white">Browse Jobs</span>
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
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-lg rounded-lg focus:bg-white/10 transition-colors focus:border-blue-300"
                />
              </div>
              <Button className="bg-white text-black px-8 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group hover:bg-white-90">
                <Search className="w-5 h-5 mr-2" />
                Search Jobs
              </Button>
            </div>

            {/* Filters - Keeping UI but functionality might be limited by DB schema for now */}
            {/* ... (Keeping filters for UI consistency, even if they don't filter much yet) ... */}
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
      </motion.div>

      {/* Job Listings */}
      <div className="space-y-6">
        <AnimatePresence>
          {sortedJobs.map((job, index) => (
            <motion.div
              key={job._id}
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
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 leading-relaxed line-clamp-2">{job.description}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills && job.skills.map((skill: string) => (
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
                          {job.paymentCurrency === 'INR' ? (
                            <IndianRupee className="w-4 h-4 text-green-400" />
                          ) : (
                            <Tag className="w-4 h-4 text-purple-400" />
                          )}
                          <div>
                            <span className="font-semibold text-white">
                              {job.paymentCurrency === 'INR' ? `₹${job.budget}` : `${job.budget} ETH`}
                            </span>
                            <p className="text-xs text-gray-400">Budget</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="font-semibold text-white">{new Date(job.createdAt).toLocaleDateString()}</span>
                            <p className="text-xs text-gray-400">Posted</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaveJob(job._id)}
                      className={`${savedJobs.includes(job._id)
                        ? "text-red-400 hover:text-red-300"
                        : "text-gray-400 hover:text-white"
                        } hover:bg-white/10`}
                    >
                      <Heart className={`w-5 h-5 ${savedJobs.includes(job._id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {/* Client Info & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {job.client?.fullName
                              ? job.client.fullName.split(" ").map((n: string) => n[0]).join("")
                              : "C"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{job.client?.fullName || "Client"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="border-white/40 text-white hover:bg-white/10 bg-transparent hover:text-white"
                            onClick={() => {
                                setSelectedJob(job);
                                setIsDetailsModalOpen(true);
                            }}
                        >
                            View Job
                        </Button>
                      {submittedProposals.includes(job._id) ? (
                        <Button disabled className="bg-green-600/50 text-white">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Proposal Sent
                        </Button>
                      ) : (
                        <Dialog
                          open={showProposalDialog && selectedJob?._id === job._id}
                          onOpenChange={setShowProposalDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="bg-blue-700 hover:to-purple-700 hover:bg-blue-600 to-purple-600 text-white px-6 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
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
                                    Your Rate (in {selectedJob?.paymentCurrency}) *
                                  </Label>
                                  <Input
                                    id="budget"
                                    placeholder="Total amount"
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
                                  className="bg-blue-600 hover:bg-blue-700"
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

        <JobDetailsModal
            job={selectedJob}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
        />
    </div>
  )
}

