"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, Search, MoreVertical, Eye, Trash2, Calendar, Wallet } from "lucide-react"

interface Job {
    _id: string
    title: string
    description: string
    budget: string
    paymentCurrency: string
    status: string
    deadline?: string
    createdAt: string
    proposalsCount: number
    client?: { fullName: string; email: string }
}

const STATUS_COLORS: Record<string, string> = {
    open: "bg-green-500/20 text-green-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    completed: "bg-purple-500/20 text-purple-400",
    cancelled: "bg-red-500/20 text-red-400",
    contract_pending: "bg-yellow-500/20 text-yellow-400",
    funded: "bg-cyan-500/20 text-cyan-400",
}

export default function AdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

    const fetchJobs = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(search && { search }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/jobs?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setJobs(data.jobs)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching jobs:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [statusFilter])

    const handleSearch = () => {
        setLoading(true)
        fetchJobs(1)
    }

    const handleUpdateStatus = async (jobId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/jobs/${jobId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                fetchJobs(pagination.page)
            }
        } catch (err) {
            console.error("Error updating job:", err)
        }
    }

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job?")) return

        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/jobs/${jobId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                fetchJobs(pagination.page)
            }
        } catch (err) {
            console.error("Error deleting job:", err)
        }
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
                    <span className="text-sm font-medium text-white">Jobs Management</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Manage <span className="text-green-400">Jobs</span>
                </h1>
                <p className="text-xl text-gray-300">View and manage all platform jobs</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search jobs by title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch} className="bg-green-500 hover:bg-green-600 text-white">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Jobs List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">
                            Jobs ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No jobs found</p>
                        ) : (
                            <div className="space-y-3">
                                {jobs.map((job, index) => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                                                <p className="text-sm text-gray-400">
                                                    by {job.client?.fullName || "Unknown"} • {job.proposalsCount} proposals
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={STATUS_COLORS[job.status] || "bg-gray-500/20 text-gray-400"}>
                                                    {job.status.replace("_", " ")}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-gray-900 border-white/10">
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(job._id, "open")}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            Set as Open
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(job._id, "completed")}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            Set as Completed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(job._id, "cancelled")}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            Set as Cancelled
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteJob(job._id)}
                                                            className="text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Job
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Wallet className="w-4 h-4" />
                                                <span>{job.budget} ETH</span>
                                            </div>
                                            {job.deadline && (
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(job.deadline).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchJobs(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="border-white/10 text-white hover:bg-white/10"
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-gray-400">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => fetchJobs(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="border-white/10 text-white hover:bg-white/10"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
