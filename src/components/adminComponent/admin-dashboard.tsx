"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Briefcase,
    FileText,
    CreditCard,
    MessageSquare,
    TrendingUp,
    Activity,
    Shield,
} from "lucide-react"
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

interface DashboardStats {
    totalUsers: number
    totalClients: number
    totalFreelancers: number
    totalJobs: number
    openJobs: number
    totalContracts: number
    pendingProposals: number
    totalTransactions: number
}

interface RecentActivity {
    jobs: Array<{
        _id: string
        title: string
        createdAt: string
        status: string
        client?: { fullName: string }
    }>
    contracts: Array<{
        _id: string
        contractId: string
        status: string
        createdAt: string
        totalAmount: string
        client?: { fullName: string }
        freelancer?: { fullName: string }
    }>
}

const COLORS = ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"]

const STATUS_COLORS: Record<string, string> = {
    open: "bg-green-500/20 text-green-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    completed: "bg-purple-500/20 text-purple-400",
    cancelled: "bg-red-500/20 text-red-400",
    contract_pending: "bg-yellow-500/20 text-yellow-400",
    funded: "bg-cyan-500/20 text-cyan-400",
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
    const [userGrowth, setUserGrowth] = useState<any[]>([])
    const [jobsByStatus, setJobsByStatus] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("adminToken")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (res.ok) {
                    const data = await res.json()
                    setStats(data.stats)
                    setRecentActivity(data.recentActivity)

                    // Transform user growth data for chart
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    const growthData = data.charts.userGrowth.map((item: any) => ({
                        name: months[item._id.month - 1],
                        users: item.count,
                    }))
                    setUserGrowth(growthData)

                    // Transform jobs by status for pie chart
                    const statusData = data.charts.jobsByStatus.map((item: any) => ({
                        name: item._id ? item._id.replace("_", " ").toUpperCase() : "Unknown",
                        value: item.count,
                    }))
                    setJobsByStatus(statusData)
                }
            } catch (err) {
                console.error("Error fetching admin stats:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        )
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            subtitle: `${stats?.totalClients || 0} Clients • ${stats?.totalFreelancers || 0} Freelancers`,
            icon: Users,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Total Jobs",
            value: stats?.totalJobs || 0,
            subtitle: `${stats?.openJobs || 0} Open`,
            icon: Briefcase,
            color: "from-green-500 to-emerald-500",
        },
        {
            title: "Contracts",
            value: stats?.totalContracts || 0,
            subtitle: "Active contracts",
            icon: FileText,
            color: "from-purple-500 to-pink-500",
        },
        {
            title: "Pending Proposals",
            value: stats?.pendingProposals || 0,
            subtitle: "Awaiting review",
            icon: MessageSquare,
            color: "from-orange-500 to-red-500",
        },
        {
            title: "Transactions",
            value: stats?.totalTransactions || 0,
            subtitle: "Platform payments",
            icon: CreditCard,
            color: "from-indigo-500 to-purple-500",
        },
    ]

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
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Admin Dashboard</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Platform <span className="text-purple-400">Overview</span>
                </h1>
                <p className="text-xl text-gray-300">Monitor and manage your freelancing platform</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div
                                        className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                                    >
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                User Growth
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(0,0,0,0.8)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Jobs by Status Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-cyan-400" />
                                Jobs by Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={jobsByStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {jobsByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(0,0,0,0.8)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Jobs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-green-400" />
                                Recent Jobs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentActivity?.jobs && recentActivity.jobs.length > 0 ? (
                                recentActivity.jobs.map((job) => (
                                    <div
                                        key={job._id}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white truncate max-w-[200px]">{job.title}</p>
                                            <p className="text-xs text-gray-400">
                                                by {job.client?.fullName || "Unknown"} •{" "}
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge className={STATUS_COLORS[job.status] || "bg-gray-500/20 text-gray-400"}>
                                            {job.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">No recent jobs</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Contracts */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-400" />
                                Recent Contracts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentActivity?.contracts && recentActivity.contracts.length > 0 ? (
                                recentActivity.contracts.map((contract) => (
                                    <div
                                        key={contract._id}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {contract.contractId.slice(0, 8)}...
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {contract.client?.fullName || "Client"} → {contract.freelancer?.fullName || "Freelancer"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={STATUS_COLORS[contract.status.toLowerCase()] || "bg-gray-500/20 text-gray-400"}>
                                                {contract.status}
                                            </Badge>
                                            <p className="text-xs text-gray-400 mt-1">{contract.totalAmount} ETH</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">No recent contracts</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
