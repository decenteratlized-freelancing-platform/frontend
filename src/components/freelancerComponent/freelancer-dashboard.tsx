"use client"
import { useSession,} from "next-auth/react";
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useCurrentUser} from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react"
import {
  DollarSign,
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
import {  Select, SelectContent, SelectItem,  SelectTrigger,  SelectValue } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
// removed server model import


const proposals = [
  {
    id: 1,
    jobTitle: "E-commerce Website Development",
    client: "TechCorp Solutions",
    clientAvatar: "/placeholder.svg?height=40&width=40&text=TC",
    budget: "$5,000",
    proposedRate: "$4,500",
    deliveryTime: "3 weeks",
    status: "under_review",
    submittedDate: "2024-01-15",
    coverLetter:
      "I have extensive experience in e-commerce development with React and Node.js. I can deliver a modern, responsive website with all the features you need...",
  },
  {
    id: 2,
    jobTitle: "Mobile App UI/UX Design",
    client: "StartupXYZ",
    clientAvatar: "/placeholder.svg?height=40&width=40&text=SX",
    budget: "$3,000",
    proposedRate: "$2,800",
    deliveryTime: "2 weeks",
    status: "shortlisted",
    submittedDate: "2024-01-12",
    coverLetter:
      "I specialize in mobile app design with a focus on user experience. My portfolio includes 50+ successful mobile app designs...",
  },
  {
    id: 3,
    jobTitle: "Content Writing for Blog",
    client: "Digital Marketing Pro",
    clientAvatar: "/placeholder.svg?height=40&width=40&text=DM",
    budget: "$800",
    proposedRate: "$750",
    deliveryTime: "1 week",
    status: "accepted",
    submittedDate: "2024-01-10",
    coverLetter:
      "I'm a professional content writer with 5+ years of experience in digital marketing content. I can create engaging, SEO-optimized blog posts...",
  },
  {
    id: 4,
    jobTitle: "Logo Design Project",
    client: "Creative Agency",
    clientAvatar: "/placeholder.svg?height=40&width=40&text=CA",
    budget: "$500",
    proposedRate: "$450",
    deliveryTime: "5 days",
    status: "declined",
    submittedDate: "2024-01-08",
    coverLetter:
      "I'm a graphic designer with expertise in logo design and brand identity. I can create a unique, memorable logo that represents your brand...",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "under_review":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "shortlisted":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "accepted":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "declined":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "under_review":
      return <AlertCircle className="w-4 h-4" />
    case "shortlisted":
      return <Eye className="w-4 h-4" />
    case "accepted":
      return <CheckCircle className="w-4 h-4" />
    case "declined":
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "under_review":
      return "Under Review"
    case "shortlisted":
      return "Shortlisted"
    case "accepted":
      return "Accepted"
    case "declined":
      return "Declined"
    default:
      return "Unknown"
  }
}

export default function FreelancerDashboard() {
  const user = useCurrentUser();
  const { data: session, status } = useSession();
  const [displayName, setDisplayName] = useState("Guest");
  const [profileData, setProfileData] = useState({fullname: "", email: "", role: ""});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  useEffect(() => {
    const loginType = localStorage.getItem("loginType");

    if (loginType === "manual") {
      const name = localStorage.getItem("fullName");
      const email = localStorage.getItem("email");
      const role = localStorage.getItem("role");
      setDisplayName(name || email || "Guest");
      setProfileData({ fullname: name || "", email: email || "", role: role || ""});
    } else if (session?.user) {
      setDisplayName(session.user.name || session.user.email || "Guest");
      setProfileData({
        fullname: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role || "",
      });
    }
  }, [session, user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if(res.ok) {
        setSaveMessage("Profile updated successfully!");
        localStorage.setItem("fullName", profileData.fullname);
        localStorage.setItem("email", profileData.email);
        localStorage.setItem("role", profileData.role);
        setDisplayName(profileData.fullname || profileData.email || "Guest");  
      }else {
        setSaveMessage("Failed to update profile");
      }
    } catch (error) {
      setSaveMessage("Error updating profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
          <Briefcase className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Freelancer Dashboard</span>
        </div>
       <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Welcome back,<span className="text-green-400"> {user?.name || "Guest"}</span>
      </h1>

        <p className="text-xl text-gray-300">Here's your freelance activity overview</p>
      </motion.div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Earnings",
            value: "$12,450",
            change: "+18%",
            icon: DollarSign,
            color: "from-green-500 to-emerald-500",
          },
          {
            title: "Active Projects",
            value: "8",
            change: "+2",
            icon: Briefcase,
            color: "from-blue-500 to-cyan-500",
          },
          {
            title: "Completed Jobs",
            value: "24",
            change: "+4",
            icon: Award,
            color: "from-purple-500 to-pink-500",
          },
          {
            title: "Client Rating",
            value: "4.9",
            change: "+0.1",
            icon: Star,
            color: "from-orange-500 to-red-500",
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
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-sm text-green-400 mt-1">{stat.change} from last month</p>
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
                {proposals.map((proposal, index) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-white/20">
                          <AvatarImage src={proposal.clientAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-bold text-xs">
                            {proposal.client
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{proposal.jobTitle}</h4>
                          <p className="text-xs text-gray-400">{proposal.client}</p>
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
                        <p className="text-sm font-medium text-white">{proposal.budget}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Your Rate</p>
                        <p className="text-sm font-medium text-green-400">{proposal.proposedRate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Delivery</p>
                        <p className="text-sm font-medium text-white">{proposal.deliveryTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Submitted</p>
                        <p className="text-sm font-medium text-white">{proposal.submittedDate}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Cover Letter</p>
                      <p className="text-sm text-gray-300 line-clamp-2">{proposal.coverLetter}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {proposal.status === "accepted" && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Project
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
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
                <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse New Jobs
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Update Goals
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Check Messages
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: "Proposal submitted", project: "E-commerce Website", time: "2 hours ago" },
                  { action: "Project completed", project: "Logo Design", time: "1 day ago" },
                  { action: "Payment received", project: "Mobile App UI", time: "2 days ago" },
                  { action: "New message", project: "Content Writing", time: "3 days ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.project}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
