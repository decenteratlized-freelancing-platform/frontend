"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
    AlertTriangle,
    MessageSquare,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Wallet,
    Calendar,
    User,
    FileText,
} from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useRouter } from "next/navigation"

interface Dispute {
    _id: string
    disputeId: string
    reason: string
    description: string
    status: string
    priority: string
    createdAt: string
    contract?: { contractId: string; totalAmount: string }
    job?: { title: string }
    raisedBy?: { fullName: string; email: string; image?: string }
    againstUser?: { fullName: string; email: string; image?: string }
    messages?: Array<{ message: string; senderRole: string; sentAt: string }>
}

const STATUS_COLORS: Record<string, string> = {
    open: "bg-red-500/20 text-red-400 border-red-500/30",
    under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    resolved: "bg-green-500/20 text-green-400 border-green-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const PRIORITY_COLORS: Record<string, string> = {
    low: "bg-blue-500/20 text-blue-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    critical: "bg-red-500/20 text-red-400",
}

const REASON_LABELS: Record<string, string> = {
    payment_issue: "Payment Issue",
    quality_issue: "Quality Issue",
    deadline_missed: "Deadline Missed",
    scope_creep: "Scope Creep",
    communication_issue: "Communication Issue",
    fraud: "Fraud",
    other: "Other",
}

export default function AdminDisputes() {
    const router = useRouter()
    const [disputes, setDisputes] = useState<Dispute[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
    const [resolution, setResolution] = useState({ type: "", amount: "", notes: "" })
    const [stats, setStats] = useState({ total: 0, open: 0, underReview: 0, resolved: 0 })

    const fetchDisputes = useCallback(async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(priorityFilter !== "all" && { priority: priorityFilter }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setDisputes(data.disputes)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching disputes:", err)
        } finally {
            setLoading(false)
        }
    }, [statusFilter, priorityFilter])

    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes/stats/overview`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (err) {
            console.error("Error fetching stats:", err)
        }
    }, [])

    useEffect(() => {
        fetchDisputes()
        fetchStats()
    }, [fetchDisputes, fetchStats])

    const handleUpdateStatus = async (disputeId: string, status: string, priority?: string) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes/${disputeId}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status, priority }),
            })

            if (res.ok) {
                fetchDisputes(pagination.page)
                fetchStats()
            }
        } catch (err) {
            console.error("Error updating status:", err)
        }
    }

    const handleResolve = async () => {
        if (!selectedDispute || !resolution.type) return

        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes/${selectedDispute._id}/resolve`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resolutionType: resolution.type,
                    amount: resolution.amount,
                    notes: resolution.notes,
                }),
            })

            if (res.ok) {
                setResolveDialogOpen(false)
                setSelectedDispute(null)
                setResolution({ type: "", amount: "", notes: "" })
                fetchDisputes(pagination.page)
                fetchStats()
            }
        } catch (err) {
            console.error("Error resolving dispute:", err)
        }
    }

    const statCards = [
        { title: "Total", value: stats.total, icon: FileText, color: "from-purple-500 to-pink-500" },
        { title: "Open", value: stats.open, icon: AlertTriangle, color: "from-red-500 to-orange-500" },
        { title: "Under Review", value: stats.underReview, icon: Clock, color: "from-yellow-500 to-amber-500" },
        { title: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
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
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-white">Dispute Resolution Center</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Dispute <span className="text-red-400">Resolution</span>
                </h1>
                <p className="text-xl text-gray-300">Manage and resolve platform disputes</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-sm text-gray-400">{stat.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Disputes List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">
                            Disputes ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                            </div>
                        ) : disputes.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No disputes found</p>
                        ) : (
                            <div className="space-y-4">
                                {disputes.map((dispute, index) => (
                                    <motion.div
                                        key={dispute._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-white">{dispute.disputeId}</h3>
                                                    <Badge className={PRIORITY_COLORS[dispute.priority]}>
                                                        {dispute.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-400">{dispute.job?.title || "Unknown Job"}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={STATUS_COLORS[dispute.status]}>
                                                    {dispute.status.replace("_", " ")}
                                                </Badge>
                                                <Badge variant="outline" className="border-white/20 text-gray-300">
                                                    {REASON_LABELS[dispute.reason]}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{dispute.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar user={{ name: dispute.raisedBy?.fullName, image: dispute.raisedBy?.image }} className="w-6 h-6" />
                                                    <span className="text-xs text-gray-400">vs</span>
                                                    <UserAvatar user={{ name: dispute.againstUser?.fullName, image: dispute.againstUser?.image }} className="w-6 h-6" />
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3 text-zinc-100" />
                                                    {new Date(dispute.createdAt).toLocaleDateString()}
                                                </div>
                                                {dispute.contract && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Wallet className="w-3 h-3" />
                                                        {dispute.contract.totalAmount} ETH
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        handleUpdateStatus(dispute._id, "under_review");
                                                        router.push(`/admin/disputes/${dispute._id}`);
                                                    }}
                                                    className="border-white/20 text-white hover:bg-white/10"
                                                    disabled={dispute.status === "resolved"}
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-1" />
                                                    Open Chat
                                                </Button>
                                                <Dialog open={resolveDialogOpen && selectedDispute?._id === dispute._id} onOpenChange={(open) => {
                                                    setResolveDialogOpen(open)
                                                    if (open) setSelectedDispute(dispute)
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-500 hover:bg-green-600 text-white"
                                                            disabled={dispute.status === "resolved"}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Resolve
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-gray-900 border-white/10 text-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Resolve Dispute</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 mt-4">
                                                            <div>
                                                                <label className="text-sm text-gray-400 mb-2 block">Resolution Type</label>
                                                                <Select value={resolution.type} onValueChange={(v) => setResolution({ ...resolution, type: v })}>
                                                                    <SelectTrigger className="bg-white/5 border-white/10">
                                                                        <SelectValue placeholder="Select resolution" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-gray-900 border-white/10">
                                                                        <SelectItem value="refund_full">Full Refund to Client</SelectItem>
                                                                        <SelectItem value="refund_partial">Partial Refund</SelectItem>
                                                                        <SelectItem value="release_payment">Release Payment to Freelancer</SelectItem>
                                                                        <SelectItem value="split">Split Payment</SelectItem>
                                                                        <SelectItem value="no_action">No Action Required</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            {(resolution.type === "refund_partial" || resolution.type === "split") && (
                                                                <div>
                                                                    <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                                                                    <Input
                                                                        value={resolution.amount}
                                                                        onChange={(e) => setResolution({ ...resolution, amount: e.target.value })}
                                                                        placeholder="Enter amount"
                                                                        className="bg-white/5 border-white/10"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <label className="text-sm text-gray-400 mb-2 block">Resolution Notes</label>
                                                                <Textarea
                                                                    value={resolution.notes}
                                                                    onChange={(e) => setResolution({ ...resolution, notes: e.target.value })}
                                                                    placeholder="Add notes about the resolution..."
                                                                    className="bg-white/5 border-white/10"
                                                                />
                                                            </div>
                                                            <Button
                                                                onClick={handleResolve}
                                                                className="w-full bg-green-500 hover:bg-green-600"
                                                                disabled={!resolution.type}
                                                            >
                                                                Confirm Resolution
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
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
                                    onClick={() => fetchDisputes(pagination.page - 1)}
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
                                    onClick={() => fetchDisputes(pagination.page + 1)}
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
