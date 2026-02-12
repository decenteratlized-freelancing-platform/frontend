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
    MessageSquare,
    Send,
    FileText,
    Shield,
} from "lucide-react"
import { useSocket } from "@/context/SocketContext"

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

export default function FreelancerDisputes() {
    const { data: session } = useSession()
    const { socket } = useSocket()
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/disputes/user/${userId}`)
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

    // Real-time listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: { disputeId: string, message: any }) => {
            // Update the list if necessary
            setDisputes(prev => prev.map(d => {
                if (d._id === data.disputeId) {
                    return { ...d, messages: [...d.messages, data.message] };
                }
                return d;
            }));

            // Update the selected dispute if it's the one receiving the message
            setSelectedDispute(prev => {
                if (prev && prev._id === data.disputeId) {
                    const isDuplicate = prev.messages.some(m => 
                        m.sentAt === data.message.sentAt && m.message === data.message.message
                    );
                    if (isDuplicate) return prev;
                    
                    return { ...prev, messages: [...prev.messages, data.message] };
                }
                return prev;
            });
        };

        socket.on("disputeMessage", handleNewMessage);
        return () => {
            socket.off("disputeMessage", handleNewMessage);
        };
    }, [socket]);

    const filteredDisputes = statusFilter === "all"
        ? disputes
        : disputes.filter(d => d.status === statusFilter)

    const openDetail = async (dispute: Dispute) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/disputes/${dispute._id}`)
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/disputes/${selectedDispute._id}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender: userId,
                    senderRole: "freelancer",
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
        raisedByMe: disputes.filter(d => d.raisedBy?._id === userId).length,
        againstMe: disputes.filter(d => d.againstUser?._id === userId).length,
        resolved: disputes.filter(d => d.status === "resolved").length,
    }

    const statCards = [
        { title: "Total Disputes", value: stats.total, icon: FileText, color: "from-purple-500 to-pink-500" },
        { title: "Raised by Me", value: stats.raisedByMe, icon: AlertTriangle, color: "from-orange-500 to-red-500" },
        { title: "Against Me", value: stats.againstMe, icon: Shield, color: "from-blue-500 to-cyan-500" },
        { title: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
    ]

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
                    <Shield className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">Dispute Resolution</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">My <span className="text-orange-400">Disputes</span></h1>
                <p className="text-xl text-gray-300">Track disputes involving your contracts</p>
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
                        <CardTitle className="text-lg font-bold text-white">Dispute History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                        ) : filteredDisputes.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No disputes found</p>
                                <p className="text-sm text-gray-500 mt-1">You haven&apos;t been involved in any disputes</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredDisputes.map((dispute, index) => {
                                    const isRaisedByMe = dispute.raisedBy?._id === userId
                                    return (
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
                                                    <div className={`w-10 h-10 ${isRaisedByMe ? "bg-orange-500/20" : "bg-blue-500/20"} rounded-xl flex items-center justify-center`}>
                                                        {isRaisedByMe ? <AlertTriangle className="w-5 h-5 text-orange-400" /> : <Shield className="w-5 h-5 text-blue-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-white">{dispute.job?.title}</p>
                                                            <Badge variant="outline" className={`text-xs ${isRaisedByMe ? "border-orange-400 text-orange-400" : "border-blue-400 text-blue-400"}`}>
                                                                {isRaisedByMe ? "Raised by you" : "Against you"}
                                                            </Badge>
                                                        </div>
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
                                    )
                                })}
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
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
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
                                    <p className="text-xs text-gray-500">Raised By</p>
                                    <p className="text-white">{selectedDispute.raisedBy?.fullName}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                                <p className="text-xs text-gray-500 mb-2">Description</p>
                                <p className="text-gray-300 text-sm">{selectedDispute.description}</p>
                            </div>

                            {selectedDispute.resolution && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-xs text-green-400 mb-1">Resolution</p>
                                    <p className="text-white font-medium">{selectedDispute.resolution.type.replace(/_/g, " ")}</p>
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
                                            placeholder="Type your response..."
                                            className="bg-white/5 border-white/10 text-white text-sm flex-1"
                                            rows={2}
                                        />
                                        <Button onClick={sendMessage} disabled={sending || !message.trim()} className="bg-orange-500 hover:bg-orange-600">
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
