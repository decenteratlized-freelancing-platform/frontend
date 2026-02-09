"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import {
  Plus,
  Sparkles,
  Users,
  Clock,
  Eye,
  TrendingUp,
  CheckCircle,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import AnimatedCounter from "@/components/homepageComponents/animated-counter"
import { ProposalReviewModal } from "./proposal-review-modal"
import ChatWindow from "../chat/ChatWindow"
import { AnimatePresence } from "framer-motion"
import { JobDetailsModal } from "@/components/shared/job-details-modal"
import AnnouncementBanner from "@/components/shared/AnnouncementBanner"
import { useToast } from "@/hooks/use-toast"
import { NotificationList } from "@/components/shared/NotificationList"

const recentActivity = [
  {
    id: "1",
    type: "completion",
    title: "Project completed",
    time: "2 hours ago",
    description: "Mobile app design delivered by Sarah Wilson",
  },
  {
    id: "2",
    type: "message",
    title: "New message",
    time: "4 hours ago",
    description: "John Doe sent project update",
  },
  {
    id: "3",
    type: "update",
    title: "Milestone reached",
    time: "1 day ago",
    description: "E-commerce platform 75% complete",
  },
]

export default function ClientDashboard() {
  const { data: session } = useSession();
  const user = useCurrentUser();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("Client");
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  
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

  const [dashboardSummary, setDashboardSummary] = useState({
    activeJobsCount: 0,
    totalSpent: 0,
    freelancersHiredCount: 0,
    averageResponseTimeHours: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; image?: string } | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    const nameFromSession = session?.user?.name;
    const nameFromHook = user?.name;
    const nameFromLocal =
      typeof window !== "undefined" ? localStorage.getItem("fullName") : null;

    setDisplayName(nameFromSession ?? nameFromHook ?? nameFromLocal ?? "Client");
  }, [session, user]);

  const fetchJobsList = async () => {
    if (session?.user?.email) {
      try {
        const token = await ensureToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs/my-jobs?email=${session.user.email}`,
          {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Error fetching jobs list:", error);
      } finally {
        setJobsLoading(false);
      }
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
        setPublishingId(jobId);
        const token = await ensureToken();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs/${jobId}/publish`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            toast({ title: "Success", description: "Job published successfully!" });
            fetchJobsList(); // Refresh list
        } else {
            const data = await res.json();
            toast({ 
                title: "Failed to Publish", 
                description: data.error || "Please check your wallet and budget.", 
                variant: "destructive" 
            });
        }
    } catch (error) {
        console.error("Error publishing job:", error);
        toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
        setPublishingId(null);
    }
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (session?.user?.email) {
        try {
          const token = await ensureToken();
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/dashboard/summary?email=${session.user.email}`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          );
          if (res.ok) {
            const data = await res.json();
            setDashboardSummary(data);
          }
        } catch (error) {
          console.error("Error fetching dashboard summary:", error);
        } finally {
          setDashboardLoading(false);
        }
      }
    };

    if (session?.user?.email) {
      fetchSummary();
    }
  }, [session]);

  useEffect(() => {
    const fetchJobsList = async () => {
      if (session?.user?.email) {
        try {
          const token = await ensureToken();
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs/my-jobs?email=${session.user.email}`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          );
          if (res.ok) {
            const data = await res.json();
            setJobs(data);
          }
        } catch (error) {
          console.error("Error fetching jobs list:", error);
        } finally {
          setJobsLoading(false);
        }
      }
    };

    if (session?.user?.email) {
      fetchJobsList();
    }
  }, [session]);

  const stats = [
    {
      title: "Active Jobs",
      value: jobs.length,
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Spent",
      value: dashboardSummary.totalSpent,
      displayValue: `${dashboardSummary.totalSpent} ETH`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Freelancers Hired",
      value: dashboardSummary.freelancersHiredCount,
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Response Time",
      value: dashboardSummary.averageResponseTimeHours,
      icon: Clock,
      color: "from-orange-500 to-red-500",
      suffix: "h",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <AnnouncementBanner role="client" />
      <ProposalReviewModal
        jobId={selectedJobId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onMessage={(freelancerId: string, freelancerName: string, freelancerImage?: string) => {
          setActiveChat({ id: freelancerId, name: freelancerName, image: freelancerImage })
          setIsReviewModalOpen(false)
        }}
      />
      <JobDetailsModal
        job={selectedJob}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AnimatePresence>
        {activeChat && (
          <ChatWindow
            receiverId={activeChat.id}
            receiverName={activeChat.name}
            receiverImage={activeChat.image}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Client Dashboard</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between mb-12"
      >
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Welcome Back,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="text-xl text-zinc-300">Manage your projects and find talented freelancers</p>
        </div>
        <Link href="/client/post-job">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-white text-zinc-800 px-5 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-blue-500/40 hover:bg-white/95 transition-all duration-300 group">
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Post New Job
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat: any, index) => (
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
                    <p className="text-sm font-medium text-zinc-400">{stat.title}</p>
                    {dashboardLoading ? (
                      <div className="h-6 bg-white/5 rounded w-2/3 mt-2 animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-white mt-2">
                        {stat.displayValue ? (
                          <span>{stat.displayValue}</span>
                        ) : (
                          <AnimatedCounter end={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix || ""} />
                        )}
                      </p>
                    )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobsLoading ? (
                  <p className="text-zinc-400">Loading projects...</p>
                ) : jobs.length === 0 ? (
                  <p className="text-zinc-400">No projects found. Post a job to get started!</p>
                ) : (
                  jobs.map((job, index) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                          <p className="text-sm text-zinc-400">
                            {job.proposalsCount} Proposals
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-white">
                            {`${job.budget} ETH`}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span className="text-xs text-zinc-400">
                              {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Status</span>
                          <span className="text-white font-semibold capitalize">{job.status.replace('_', ' ')}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              job.status === 'completed' ? 'bg-emerald-500' : 
                              job.status === 'in_progress' ? 'bg-blue-500' : 
                              'bg-zinc-600'
                            }`}
                            style={{ width: job.status === 'completed' ? '100%' : job.status === 'in_progress' ? '50%' : '10%' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.status === "completed"
                            ? "bg-green-500/20 text-green-300"
                            : job.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : job.status === "draft"
                                ? "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                        >
                          {job.status === "draft" ? "DRAFT" : job.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          {job.status === "draft" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                              onClick={() => handlePublishJob(job._id)}
                              disabled={publishingId === job._id}
                            >
                              {publishingId === job._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                              )}
                              Publish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent hover:text-white"
                            onClick={() => {
                              setSelectedJob(job)
                              setIsDetailsModalOpen(true)
                            }}
                          >
                            View Job
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent hover:text-white"
                            onClick={() => {
                              setSelectedJobId(job._id)
                              setIsReviewModalOpen(true)
                            }}
                          >
                            View Proposals ({job.proposalsCount})
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="h-full"
        >
          <NotificationList />
        </motion.div>
      </div>
    </div>
  )
}