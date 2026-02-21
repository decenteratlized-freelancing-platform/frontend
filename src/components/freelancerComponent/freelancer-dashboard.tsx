"use client"
import { useSession } from "next-auth/react";
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/shared/user-avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState, useCallback } from "react"
import { useCurrency } from "@/context/CurrencyContext";
import { useRouter } from "next/navigation";
import {
  CoinsIcon,
  Clock,
  Star,
  Briefcase,
  MessageSquare,
  Target,
  Award,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
} from "lucide-react"
import AnnouncementBanner from "@/components/shared/AnnouncementBanner";
import { NotificationList } from "@/components/shared/NotificationList";
import { GettingStarted } from "../shared/getting-started";
import { CurrencyLogo } from "../shared/currency-logo";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "shortlisted":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "accepted":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <AlertCircle className="w-4 h-4" />
    case "shortlisted":
      return <Eye className="w-4 h-4" />
    case "accepted":
      return <CheckCircle className="w-4 h-4" />
    case "rejected":
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending"
    case "shortlisted":
      return "Shortlisted"
    case "accepted":
      return "Accepted"
    case "rejected":
      return "Rejected"
    default:
      return "Unknown"
  }
}

export default function FreelancerDashboard() {
  const { getFormattedAmount, getConvertedAmount } = useCurrency();
  const user = useCurrentUser();
  const { data: session, status } = useSession();
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    activeProjectsCount: 0,
    completedJobsCount: 0,
    rating: 0,
  });
  const [isGettingStartedDismissed, setIsGettingStartedDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("gettingStartedDismissed_freelancer") === "true";
    setIsGettingStartedDismissed(dismissed);
  }, []);

  const handleJobsRedirect = () => { router.push('/freelancer/browse-jobs') }
  const handleGoalsRedirect = () => { router.push('/freelancer/goals') }
  const handleMessagesRedirect = () => { router.push('/freelancer/messages') }

  useEffect(() => {
    const fetchFullProfile = async () => {
      const email = session?.user?.email || localStorage.getItem("email");
      if (email) {
        try {
          const res = await fetch(`/api/settings?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            setFullProfile(data.profile);
          }
        } catch (err) {
          console.error("Fetch profile failed:", err);
        }
      }
    };
    fetchFullProfile();
  }, [session]);

  const fetchDashboardStats = useCallback(async () => {
    const email = session?.user?.email || localStorage.getItem("email");
    if (email) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/dashboard/freelancer/summary?email=${email}`);
        if (res.ok) {
          const data = await res.json();
          setDashboardStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const fetchProposals = useCallback(async () => {
    const email = session?.user?.email || localStorage.getItem("email");
    if (email) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/proposals/my-proposals?email=${email}`);
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setLoadingProposals(false);
      }
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const gettingStartedSteps = [
    {
      title: "Complete Profile",
      description: "Add your bio, skills and professional title.",
      completed: !!(fullProfile?.professionalBio && fullProfile?.skills?.length > 0),
      link: "/freelancer/settings"
    },
    {
      title: "Build Portfolio",
      description: "Showcase your best work to attract clients.",
      completed: !!(fullProfile?.portfolio?.length > 0),
      link: "/freelancer/portfolio"
    },
    {
      title: "Link Wallet",
      description: "Connect your MetaMask to receive crypto payments.",
      completed: !!(fullProfile?.walletAddress),
      link: "/freelancer/settings"
    },
    {
      title: "Find First Job",
      description: "Browse open roles and submit your first proposal.",
      completed: proposals.length > 0,
      link: "/freelancer/browse-jobs"
    }
  ];

  const allStepsCompleted = gettingStartedSteps.every(step => step.completed);

  // Automatically dismiss if all steps are completed
  useEffect(() => {
    if (allStepsCompleted && !loadingProposals && fullProfile) {
      localStorage.setItem("gettingStartedDismissed_freelancer", "true");
      setIsGettingStartedDismissed(true);
    }
  }, [allStepsCompleted, loadingProposals, fullProfile]);

  const handleDismissGettingStarted = () => {
    localStorage.setItem("gettingStartedDismissed_freelancer", "true");
    setIsGettingStartedDismissed(true);
  };

  const showGettingStarted = !isGettingStartedDismissed && !allStepsCompleted && !loadingProposals && !!fullProfile;

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <AnnouncementBanner role="freelancer" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <Briefcase className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Freelancer Dashboard</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome back,<span className="text-green-400"> {user?.name || "Guest"}</span>
        </h1>
        <p className="text-xl text-gray-300">Here&apos;s your freelance activity overview</p>
      </motion.div>

      {showGettingStarted && (
        <GettingStarted steps={gettingStartedSteps} onDismiss={handleDismissGettingStarted} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Earnings",
            value: getFormattedAmount(dashboardStats.totalEarnings, (dashboardStats as any).primaryCurrency || "ETH"),
            icon: CoinsIcon,
            color: "bg-emerald-600",
          },
          {
            title: "Active Projects",
            value: dashboardStats.activeProjectsCount.toString(),
            icon: Briefcase,
            color: "bg-blue-600",
          },
          {
            title: "Completed Jobs",
            value: dashboardStats.completedJobsCount.toString(),
            icon: Award,
            color: "bg-indigo-600",
          },
          {
            title: "Rating",
            value: dashboardStats.rating ? dashboardStats.rating.toString() : "N/A",
            icon: Star,
            color: "bg-amber-600",
          },
        ].map((stat, index) => (
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
                    <div className="flex items-center gap-2 mt-2">
                      {stat.title === "Total Earnings" && <CurrencyLogo currency={(dashboardStats as any).primaryCurrency || "ETH"} size={18} />}
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg shadow-black/20`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  My Proposals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingProposals ? (
                  <p className="text-gray-400">Loading proposals...</p>
                ) : proposals.length === 0 ? (
                  <p className="text-gray-400">No proposals submitted yet.</p>
                ) : (
                  proposals.map((proposal, index) => (
                    <motion.div
                      key={proposal._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={{
                              name: proposal.job?.client?.fullName || "Client",
                              image: proposal.job?.client?.image
                            }}
                            className="w-10 h-10 border border-white/20"
                          />
                          <div>
                            <h4 className="font-semibold text-white text-sm">{proposal.job?.title || "Unknown Job"}</h4>
                            <p className="text-xs text-gray-400">{proposal.job?.client?.fullName || "Unknown Client"}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                          {getStatusIcon(proposal.status)}
                          {getStatusText(proposal.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Client Budget</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CurrencyLogo currency={proposal.job?.paymentCurrency || "ETH"} size={12} />
                                                      <p className="text-sm font-medium text-white">
                                                        {getFormattedAmount(proposal.job?.budget || 0, proposal.job?.paymentCurrency || "ETH")}
                                                      </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Your Rate</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CurrencyLogo currency={proposal.job?.paymentCurrency || "ETH"} size={12} />
                                                      <p className="text-sm font-medium text-green-400">
                                                        {getFormattedAmount(proposal.proposedRate || 0, proposal.job?.paymentCurrency || "ETH")}
                                                      </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Delivery</p>
                          <p className="text-sm font-medium text-white">{proposal.deliveryTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Submitted</p>
                          <p className="text-sm font-medium text-white">{new Date(proposal.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">Cover Letter</p>
                        <p className="text-sm text-gray-300 line-clamp-2">{proposal.coverLetter}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        {proposal.status === "accepted" && (
                          <Button
                            size="sm"
                            className="bg-white/90 hover:bg-white/80 text-zinc-950 rounded-xl p-4 hover:text-black-600 transition-all duration-300 group"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Project
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={handleJobsRedirect}
                  className="w-full group flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-all duration-300 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Find Work</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Browse new opportunities</p>
                  </div>
                </button>

                <button
                  onClick={handleGoalsRedirect}
                  className="w-full group flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-all duration-300 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Set Goals</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Update your targets</p>
                  </div>
                </button>

                <button
                  onClick={handleMessagesRedirect}
                  className="w-full group flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-all duration-300 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Messages</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Chat with clients</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="h-full"
          >
            <NotificationList />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
