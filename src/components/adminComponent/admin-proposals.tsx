"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { MessageSquare, Wallet, Calendar, MoreVertical } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

interface Proposal {
    _id: string
    coverLetter: string
    proposedRate: string
    deliveryTime: string
    paymentMode: string
    status: string
    createdAt: string
    job?: { title: string; budget: string }
    freelancer?: { fullName: string; email: string; image?: string }
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    shortlisted: "bg-blue-500/20 text-blue-400",
    accepted: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
}

export default function AdminProposals() {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

    const fetchProposals = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/proposals?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setProposals(data.proposals)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching proposals:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProposals()
    }, [statusFilter])

    const handleUpdateStatus = async (proposalId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/proposals/${proposalId}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                fetchProposals(pagination.page)
            }
        } catch (err) {
            console.error("Error updating proposal:", err)
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
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-white">Proposals Management</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Manage <span className="text-pink-400">Proposals</span>
                </h1>
                <p className="text-xl text-gray-300">View and manage all freelancer proposals</p>
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
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Proposals List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">
                            Proposals ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                            </div>
                        ) : proposals.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No proposals found</p>
                        ) : (
                            <div className="space-y-4">
                                {proposals.map((proposal, index) => (
                                    <motion.div
                                        key={proposal._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar
                                                    user={{ name: proposal.freelancer?.fullName, image: proposal.freelancer?.image }}
                                                    className="w-10 h-10"
                                                />
                                                <div>
                                                    <p className="font-medium text-white">{proposal.freelancer?.fullName || "Unknown"}</p>
                                                    <p className="text-sm text-gray-400">{proposal.freelancer?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={STATUS_COLORS[proposal.status] || "bg-gray-500/20 text-gray-400"}>
                                                    {proposal.status}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-gray-900 border-white/10">
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(proposal._id, "shortlisted")}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            Set as Shortlisted
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(proposal._id, "accepted")}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            Set as Accepted
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(proposal._id, "rejected")}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            Set as Rejected
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-sm text-gray-400 mb-1">Job: {proposal.job?.title || "Unknown"}</p>
                                            <p className="text-sm text-gray-300 line-clamp-2">{proposal.coverLetter}</p>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Wallet className="w-4 h-4" />
                                                <span>Rate: {proposal.proposedRate} ETH</span>
                                            </div>
                                            <div className="text-gray-400">
                                                Delivery: {proposal.deliveryTime}
                                            </div>
                                            <div className="text-gray-400">
                                                Mode: {proposal.paymentMode}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500 ml-auto">
                                                <Calendar className="w-3 h-3 text-zinc-100" />
                                                {new Date(proposal.createdAt).toLocaleDateString()}
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
                                    onClick={() => fetchProposals(pagination.page - 1)}
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
                                    onClick={() => fetchProposals(pagination.page + 1)}
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
