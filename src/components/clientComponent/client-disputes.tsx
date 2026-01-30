"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
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
} from "@/components/ui/dialog"
import {
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare,
    Send,
    FileText,
} from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

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
    raisedBy?: { _id: string; fullName: string; image?: string }
    againstUser?: { _id: string; fullName: string; image?: string }
    messages: Array<{
        sender: { fullName: string; image?: string } | string
        senderRole: string
        message: string
        sentAt: string
    }>
    resolution?: {
        type: string
        description: string
        resolvedAt: string
    }
}

const STATUS_COLORS: Record<string, string> = {
    open: "bg-red-500/20 text-red-400",
    under_review: "bg-blue-500/20 text-blue-400",
    resolved: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
}

const REASON_LABELS: Record<string, string> = {
    payment_not_released: "Payment Not Released",
    quality_issues: "Quality Issues",
    scope_disagreement: "Scope Disagreement",
    non_delivery: "Non-Delivery",
    communication_issues: "Communication Issues",
    contract_violation: "Contract Violation",
    fraud: "Suspected Fraud",
    other: "Other",
}

export default function ClientDisputes() {
    const { data: session } = useSession()
    const [disputes, setDisputes] = useState<Dispute[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)

    const userId = (session?.user as any)?.id

    const fetchDisputes = async () => {
        if (!userId) return

        try {
            const res = await fetch(`http://localhost:5000/api/disputes/user/${userId}`)
            if (res.ok) {
                const data = await res.json()
                setDisputes(data)
            }
        } catch (err) {
            console.error("Error fetching disputes:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userId) fetchDisputes()
    }, [userId])

    const filteredDisputes = statusFilter === "all"
        ? disputes
        : disputes.filter(d => d.status === statusFilter)

    const openDetail = async (dispute: Dispute) => {
        try {
            const res = await fetch(`http://localhost:5000/api/disputes/${dispute._id}`)
            if (res.ok) {
                const fullDispute = await res.json()
                setSelectedDispute(fullDispute)
                setDetailOpen(true)
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    const sendMessage = async () => {
        if (!selectedDispute || !message.trim()) return

        setSending(true)
        try {
            const res = await fetch(`http://localhost:5000/api/disputes/${selectedDispute._id}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender: userId,
                    senderRole: "client",
                    message: message.trim(),
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setSelectedDispute(data.dispute)
                setMessage("")
            }
        } catch (err) {
            console.error("Error:", err)
        } finally {
            setSending(false)
        }
    }

    const stats = {
        total: disputes.length,
        open: disputes.filter(d => d.status === "open").length,
        underReview: disputes.filter(d => d.status === "under_review").length,
        resolved: disputes.filter(d => d.status === "resolved").length,
    }

    const statCards = [
        { title: "Total Disputes", value: stats.total, icon: FileText, color: "from-purple-500 to-pink-500" },
        { title: "Open", value: stats.open, icon: AlertTriangle, color: "from-red-500 to-orange-500" },
        { title: "Under Review", value: stats.underReview, icon: Clock, color: "from-blue-500 to-cyan-500" },
        { title: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
    ]

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-white">Dispute Resolution</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">My <span className="text-red-400">Disputes</span></h1>
                <p className="text-xl text-gray-300">Track and manage your contract disputes</p>
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
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Disputes List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">Your Disputes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                            </div>
                        ) : filteredDisputes.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No disputes found</p>
                                <p className="text-sm text-gray-500 mt-1">Disputes can be raised from your contract pages</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredDisputes.map((dispute, index) => (
                                    <motion.div
                                        key={dispute._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => openDetail(dispute)}
                                        className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{dispute.job?.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm text-gray-400">{dispute.disputeId}</span>
                                                        <span className="text-gray-600">•</span>
                                                        <span className="text-sm text-gray-400">{REASON_LABELS[dispute.reason] || dispute.reason}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <Badge className={STATUS_COLORS[dispute.status]}>{dispute.status.replace("_", " ")}</Badge>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <MessageSquare className="w-5 h-5 text-gray-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Dispute Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Dispute Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDispute && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-500">Dispute ID</p>
                                    <p className="text-white font-medium">{selectedDispute.disputeId}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <Badge className={STATUS_COLORS[selectedDispute.status]}>{selectedDispute.status.replace("_", " ")}</Badge>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-500">Reason</p>
                                    <p className="text-white">{REASON_LABELS[selectedDispute.reason]}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-500">Contract</p>
                                    <p className="text-white">{selectedDispute.contract?.contractId}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                                <p className="text-xs text-gray-500 mb-2">Description</p>
                                <p className="text-gray-300 text-sm">{selectedDispute.description}</p>
                            </div>

                            {selectedDispute.resolution && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-xs text-green-400 mb-1">Resolution</p>
                                    <p className="text-white font-medium">{selectedDispute.resolution.type.replace("_", " ")}</p>
                                    <p className="text-sm text-gray-300 mt-1">{selectedDispute.resolution.description}</p>
                                </div>
                            )}

                            {/* Messages */}
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-sm font-medium text-white mb-3">Messages</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                                    {selectedDispute.messages.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No messages yet</p>
                                    ) : (
                                        selectedDispute.messages.map((msg, i) => (
                                            <div key={i} className={`p-2 rounded-lg text-sm ${msg.senderRole === "admin" ? "bg-purple-500/20 ml-4" : "bg-white/10 mr-4"}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-gray-400">{msg.senderRole}</span>
                                                    <span className="text-xs text-gray-500">{new Date(msg.sentAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-white">{msg.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedDispute.status !== "resolved" && selectedDispute.status !== "closed" && (
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="bg-white/5 border-white/10 text-white text-sm flex-1"
                                            rows={2}
                                        />
                                        <Button onClick={sendMessage} disabled={sending || !message.trim()} className="bg-red-500 hover:bg-red-600">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
