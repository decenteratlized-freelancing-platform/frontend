"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    BarChart3,
    TrendingUp,
    Users,
    Briefcase,
    FileText,
    IndianRupee,
    Calendar,
    Download,
} from "lucide-react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"

const COLORS = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState("6months")
    const [revenue, setRevenue] = useState<any>({ revenueByMonth: [], totalRevenue: 0, revenueByMode: [] })
    const [platform, setPlatform] = useState<any>({ users: {}, jobs: {}, contracts: {}, transactions: {} })
    const [growth, setGrowth] = useState<any>({ userGrowth: [], jobGrowth: [], contractGrowth: [] })

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("adminToken")
            const [revenueRes, platformRes, growthRes] = await Promise.all([
                fetch(`http://localhost:5000/api/admin/analytics/revenue?period=${period}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:5000/api/admin/analytics/platform", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:5000/api/admin/analytics/growth", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            if (revenueRes.ok) setRevenue(await revenueRes.json())
            if (platformRes.ok) setPlatform(await platformRes.json())
            if (growthRes.ok) setGrowth(await growthRes.json())
        } catch (err) {
            console.error("Error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const formatGrowthData = (data: any[]) => {
        return data.map((item) => ({
            name: months[item._id.month - 1],
            value: item.count,
        }))
    }

    const statCards = [
        { title: "Total Users", value: platform.users?.total || 0, sub: `+${platform.users?.newThisMonth || 0} this month`, icon: Users, color: "from-blue-500 to-cyan-500" },
        { title: "Active Jobs", value: platform.jobs?.active || 0, sub: `${platform.jobs?.total || 0} total`, icon: Briefcase, color: "from-green-500 to-emerald-500" },
        { title: "Contracts", value: platform.contracts?.completed || 0, sub: `${platform.contracts?.total || 0} total`, icon: FileText, color: "from-purple-500 to-pink-500" },
        { title: "Total Revenue", value: `₹${Math.round(revenue.totalRevenue).toLocaleString()}`, sub: "All time", icon: IndianRupee, color: "from-orange-500 to-red-500" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Analytics & Reports</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">Platform <span className="text-cyan-400">Analytics</span></h1>
                        <p className="text-xl text-gray-300">Monitor revenue, growth, and platform metrics</p>
                    </div>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10">
                            <SelectItem value="7days">7 Days</SelectItem>
                            <SelectItem value="30days">30 Days</SelectItem>
                            <SelectItem value="3months">3 Months</SelectItem>
                            <SelectItem value="6months">6 Months</SelectItem>
                            <SelectItem value="1year">1 Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-sm text-gray-400">{stat.title}</p>
                                        <p className="text-xs text-gray-500">{stat.sub}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                Revenue Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenue.revenueByMonth.map((item: any) => ({ name: months[item._id.month - 1], revenue: item.total }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} />
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Revenue by Mode */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-orange-400" />
                                Revenue by Payment Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={revenue.revenueByMode.map((item: any) => ({ name: item._id || "Unknown", value: item.total }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ₹${Math.round(value).toLocaleString()}`}
                                        >
                                            {revenue.revenueByMode.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row 2 - Growth */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Growth Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formatGrowthData(growth.userGrowth)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
