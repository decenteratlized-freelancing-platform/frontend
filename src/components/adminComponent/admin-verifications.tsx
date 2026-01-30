"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, Calendar, User } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

interface VerificationRequest {
    _id: string
    type: string
    status: string
    createdAt: string
    documents: Array<{ name: string; url: string }>
    user?: { fullName: string; email: string; image?: string; role: string }
    reviewedBy?: { fullName: string }
    reviewedAt?: string
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    under_review: "bg-blue-500/20 text-blue-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
}

const TYPE_LABELS: Record<string, string> = {
    identity: "Identity Verification",
    portfolio: "Portfolio Review",
    skills: "Skills Assessment",
    education: "Education Credential",
    employment: "Employment History",
}

export default function AdminVerifications() {
    const [requests, setRequests] = useState<VerificationRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
    const [review, setReview] = useState({ status: "", notes: "", rejectionReason: "" })
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })

    const fetchRequests = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
            })

            const res = await fetch(`http://localhost:5000/api/admin/verifications?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setRequests(data.requests)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching verifications:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch("http://localhost:5000/api/admin/verifications/stats/overview", {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (err) {
            console.error("Error fetching stats:", err)
        }
    }

    useEffect(() => {
        fetchRequests()
        fetchStats()
    }, [statusFilter])

    const handleReview = async () => {
        if (!selectedRequest || !review.status) return

        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`http://localhost:5000/api/admin/verifications/${selectedRequest._id}/review`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: review.status,
                    adminNotes: review.notes,
                    rejectionReason: review.rejectionReason,
                }),
            })

            if (res.ok) {
                setReviewDialogOpen(false)
                setSelectedRequest(null)
                setReview({ status: "", notes: "", rejectionReason: "" })
                fetchRequests(pagination.page)
                fetchStats()
            }
        } catch (err) {
            console.error("Error reviewing:", err)
        }
    }

    const statCards = [
        { title: "Total", value: stats.total, icon: FileText, color: "from-blue-500 to-cyan-500" },
        { title: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
        { title: "Approved", value: stats.approved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
        { title: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-pink-500" },
    ]

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">User Verification</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    User <span className="text-green-400">Verification</span>
                </h1>
                <p className="text-xl text-gray-300">Review and approve verification requests</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-gray-400">{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Requests List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">Verification Requests ({pagination.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                            </div>
                        ) : requests.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No verification requests found</p>
                        ) : (
                            <div className="space-y-3">
                                {requests.map((request, index) => (
                                    <motion.div
                                        key={request._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <UserAvatar user={{ name: request.user?.fullName, image: request.user?.image }} className="w-10 h-10" />
                                            <div>
                                                <p className="font-medium text-white">{request.user?.fullName}</p>
                                                <p className="text-sm text-gray-400">
                                                    {TYPE_LABELS[request.type]} • {request.documents.length} documents
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge className={STATUS_COLORS[request.status]}>{request.status}</Badge>
                                            <span className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</span>
                                            <Dialog open={reviewDialogOpen && selectedRequest?._id === request._id} onOpenChange={(open) => {
                                                setReviewDialogOpen(open)
                                                if (open) setSelectedRequest(request)
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" disabled={request.status !== "pending"}>
                                                        Review
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-gray-900 border-white/10 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle>Review Verification</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => setReview({ ...review, status: "approved" })}
                                                                className={`flex-1 ${review.status === "approved" ? "bg-green-500" : "bg-white/5"}`}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                                            </Button>
                                                            <Button
                                                                onClick={() => setReview({ ...review, status: "rejected" })}
                                                                className={`flex-1 ${review.status === "rejected" ? "bg-red-500" : "bg-white/5"}`}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                                            </Button>
                                                        </div>
                                                        {review.status === "rejected" && (
                                                            <div>
                                                                <label className="text-sm text-gray-400 mb-2 block">Rejection Reason</label>
                                                                <Textarea
                                                                    value={review.rejectionReason}
                                                                    onChange={(e) => setReview({ ...review, rejectionReason: e.target.value })}
                                                                    className="bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="text-sm text-gray-400 mb-2 block">Admin Notes</label>
                                                            <Textarea
                                                                value={review.notes}
                                                                onChange={(e) => setReview({ ...review, notes: e.target.value })}
                                                                className="bg-white/5 border-white/10"
                                                            />
                                                        </div>
                                                        <Button onClick={handleReview} className="w-full bg-purple-500 hover:bg-purple-600" disabled={!review.status}>
                                                            Confirm Review
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button variant="outline" onClick={() => fetchRequests(pagination.page - 1)} disabled={pagination.page === 1} className="border-white/10 text-white">Previous</Button>
                                <span className="flex items-center px-4 text-gray-400">Page {pagination.page} of {pagination.pages}</span>
                                <Button variant="outline" onClick={() => fetchRequests(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="border-white/10 text-white">Next</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
