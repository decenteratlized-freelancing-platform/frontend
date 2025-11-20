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
  DollarSign,
  Users,
  Clock,
  Eye,
  TrendingUp,
  CheckCircle,
  Calendar,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import AnimatedCounter from "@/components/homepageComponents/animated-counter"
import { ProposalReviewModal } from "./proposal-review-modal"
import ChatWindow from "../chat/ChatWindow"
import { AnimatePresence } from "framer-motion"

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
  const { data: session } = useSession()
  const user = useCurrentUser()
  const [displayName, setDisplayName] = useState("Client")
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<{ id: string, name: string, image?: string } | null>(null)

  useEffect(() => {
    const nameFromSession = session?.user?.name
    const nameFromHook = user?.name
    const nameFromLocal =
      typeof window !== "undefined" ? localStorage.getItem("fullName") : null

    setDisplayName(nameFromSession ?? nameFromHook ?? nameFromLocal ?? "Client")
  }, [session, user])

  useEffect(() => {
    const fetchJobs = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(`http://localhost:5000/api/jobs/my-jobs?email=${session.user.email}`)
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
    }

    if (session?.user?.email) {
      fetchJobs()
    }
  }, [session])

  const activeJobsCount = jobs.filter(job => job.status === 'open' || job.status === 'in_progress').length

  const stats = [
    {
      title: "Active Jobs",
      value: activeJobsCount,
      change: "Updated just now",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Spent",
      value: 24500, // Placeholder for now
      change: "+$1,200 this month",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      prefix: "$",
    },
    {
      title: "Freelancers Hired",
      value: 48, // Placeholder
      change: "+5 this month",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Response Time",
      value: 2.4,
      change: "-0.3h improved",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      suffix: "h",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <ProposalReviewModal
        jobId={selectedJobId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onMessage={(freelancerId: string, freelancerName: string, freelancerImage?: string) => {
          setActiveChat({ id: freelancerId, name: freelancerName, image: freelancerImage })
          setIsReviewModalOpen(false) // Optional: close modal when chat starts
        }}
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between mb-12"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Client Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Welcome Back,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="text-xl text-gray-300">Manage your projects and find talented freelancers</p>
        </div>
        <Link href="/client/post-job">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group">
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Post New Job
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats Cards */}
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
                    <p className="text-2xl font-bold text-white mt-2">
                      <AnimatedCounter end={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix || ""} />
                    </p>
                    <p className="text-sm text-green-400 mt-1">{stat.change}</p>
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
                {loading ? (
                  <p className="text-gray-400">Loading projects...</p>
                ) : jobs.length === 0 ? (
                  <p className="text-gray-400">No projects found. Post a job to get started!</p>
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
                          <p className="text-sm text-gray-400">
                            {job.proposalsCount} Proposals
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-white">${job.budget?.toLocaleString()}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Status</span>
                          <span className="text-white font-semibold capitalize">{job.status.replace('_', ' ')}</span>
                        </div>
                        {/* Progress bar placeholder - could be real if we had progress tracking */}
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: job.status === 'completed' ? '100%' : job.status === 'in_progress' ? '50%' : '10%' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === "completed"
                            ? "bg-green-500/20 text-green-300"
                            : job.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-yellow-500/20 text-yellow-300"
                            }`}
                        >
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                          onClick={() => {
                            setSelectedJobId(job._id)
                            setIsReviewModalOpen(true)
                          }}
                        >
                          View Proposals ({job.proposalsCount})
                        </Button>
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
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === "completion"
                        ? "bg-gradient-to-br from-green-500 to-emerald-500"
                        : activity.type === "message"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                          : "bg-gradient-to-br from-orange-500 to-yellow-500"
                        }`}
                    >
                      {activity.type === "completion" ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : activity.type === "message" ? (
                        <MessageSquare className="w-4 h-4 text-white" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
