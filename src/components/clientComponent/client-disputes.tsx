"use client"

import { useEffect, useState, useCallback } from "react"
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
    ChevronRight,
    Shield,
} from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useSocket } from "@/context/SocketContext"
import Link from "next/link"

interface Dispute {
    _id: string
    disputeId: string
    reason: string
    description: string
    status: string
    priority: string
    createdAt: string
    contract?: { _id: string; contractId: string; totalAmount: string }
    job?: { title: string }
    raisedBy?: { _id: string; fullName: string; image?: string }
    againstUser?: { _id: string; fullName: string; image?: string }
    messages: Array<{
        sender: { _id: string; fullName: string; image?: string } | string
        senderRole: string
        message: string
        sentAt: string
    }>
    evidence: Array<{
        type: string
        title: string
        url: string
        uploadedAt: string
    }>
    timeline: Array<{
        action: string
        details: string
        timestamp: string
    }>
    resolution?: {
        type: string
        description: string
        resolvedAt: string
    }
}

const STATUS_COLORS: Record<string, string> = {
    open: "bg-red-500/10 text-red-400 border-red-500/20",
    under_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const PRIORITY_COLORS: Record<string, string> = {
    low: "text-zinc-400",
    medium: "text-blue-400",
    high: "text-orange-400",
    critical: "text-red-400",
}

const REASON_LABELS: Record<string, string> = {
    payment_issue: "Payment Issue",
    quality_issue: "Quality Issue",
    deadline_missed: "Deadline Missed",
    scope_creep: "Scope Creep",
    communication_issue: "Communication Issue",
    fraud: "Suspected Fraud",
    other: "Other",
}

export default function ClientDisputes() {
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

    const fetchDisputes = useCallback(async () => {
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
    }, [userId])

    useEffect(() => {
        if (userId) fetchDisputes()
    }, [userId, fetchDisputes])

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
                    // Avoid duplicate if the user sent it themselves
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
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <div className="inline-flex items-center gap-2 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-full px-6 py-3 mb-6">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold uppercase tracking-widest text-red-400">Dispute Resolution</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">Case <span className="text-red-500">History</span></h1>
                <p className="text-xl text-zinc-400 max-w-2xl">Official record of contract disagreements and resolutions. SmartHire AI and mediators monitor these cases to ensure fairness.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, index) => (
                    <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4 relative">
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white tracking-tighter">{stat.value}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{stat.title}</p>
                                </div>
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl`} />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                <div className="flex items-center gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800 text-white rounded-xl h-12">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <SelectItem value="all">All Cases</SelectItem>
                            <SelectItem value="open">Pending Response</SelectItem>
                            <SelectItem value="under_review">Active Mediation</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Disputes List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-zinc-800/50 bg-white/5 px-8 py-6">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-5 h-5 text-zinc-500" />
                            Recent Disputes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                            </div>
                        ) : filteredDisputes.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield className="w-10 h-10 text-zinc-700" />
                                </div>
                                <p className="text-zinc-400 font-medium text-lg">No active disputes</p>
                                <p className="text-zinc-600 text-sm mt-2 max-w-sm mx-auto">Your contracts are currently operating within the agreed terms. Use the contract details page if you need to open a case.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800/50">
                                {filteredDisputes.map((dispute, index) => (
                                    <motion.div
                                        key={dispute._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => openDetail(dispute)}
                                        className="p-6 hover:bg-white/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">{dispute.job?.title}</p>
                                                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-tighter ${PRIORITY_COLORS[dispute.priority]}`}>
                                                            {dispute.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="font-mono text-zinc-500 uppercase tracking-widest">{dispute.disputeId}</span>
                                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                        <span className="text-zinc-400 font-medium">{REASON_LABELS[dispute.reason] || dispute.reason}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right space-y-1">
                                                    <Badge className={`${STATUS_COLORS[dispute.status]} font-black uppercase tracking-widest text-[9px] px-2.5 py-1`}>
                                                        {dispute.status.replace("_", " ")}
                                                    </Badge>
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
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
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2rem]">
                    {selectedDispute && (
                        <>
                            {/* Modal Header */}
                            <div className="p-8 border-b border-zinc-800/50 bg-white/5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${STATUS_COLORS[selectedDispute.status]} font-black uppercase tracking-widest text-[10px]`}>
                                                {selectedDispute.status.replace("_", " ")}
                                            </Badge>
                                            <span className="text-zinc-600 text-xs font-mono">{selectedDispute.disputeId}</span>
                                        </div>
                                        <DialogTitle className="text-3xl font-bold tracking-tight text-white">
                                            {selectedDispute.job?.title}
                                        </DialogTitle>
                                        <p className="text-zinc-400 text-sm font-medium italic">&quot;{REASON_LABELS[selectedDispute.reason]}&quot;</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Link href={`/client/contracts/${selectedDispute.contract?._id}`}>
                                            <Button variant="outline" size="sm" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold text-xs uppercase tracking-widest h-10">
                                                <FileText className="w-4 h-4 mr-2" />
                                                View Contract
                                            </Button>
                                        </Link>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Opened {new Date(selectedDispute.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Left Column: Details, Evidence, Resolution */}
                                    <div className="lg:col-span-7 space-y-10">
                                        {/* Parties */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Complainant</p>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={{ name: selectedDispute.raisedBy?.fullName, image: selectedDispute.raisedBy?.image }} className="w-10 h-10 border-2 border-red-500/20" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{selectedDispute.raisedBy?.fullName}</p>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Petitioner</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Respondent</p>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={{ name: selectedDispute.againstUser?.fullName, image: selectedDispute.againstUser?.image }} className="w-10 h-10 border-2 border-blue-500/20" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{selectedDispute.againstUser?.fullName}</p>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Defendant</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Case Description */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                                <MessageSquare className="w-3.5 h-3.5" /> Incident Report
                                            </h4>
                                            <div className="bg-zinc-900/20 p-6 rounded-3xl border border-zinc-800/50 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                {selectedDispute.description}
                                            </div>
                                        </div>

                                        {/* Resolution */}
                                        {selectedDispute.resolution && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Verdict & Resolution
                                                </h4>
                                                <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20 space-y-3">
                                                    <Badge className="bg-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-[10px]">
                                                        {selectedDispute.resolution.type.replace("_", " ")}
                                                    </Badge>
                                                    <p className="text-zinc-200 text-sm leading-relaxed">{selectedDispute.resolution.description}</p>
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-2">Case closed on {new Date(selectedDispute.resolution.resolvedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Evidence */}
                                        {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                                    <Shield className="w-3.5 h-3.5" /> Supporting Evidence
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {selectedDispute.evidence.map((ev, i) => (
                                                        <a key={i} href={ev.url} target="_blank" className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors group">
                                                            <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-blue-400">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-zinc-200 truncate">{ev.title}</p>
                                                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{ev.type}</p>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-zinc-700" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Messages & Timeline */}
                                    <div className="lg:col-span-5 flex flex-col gap-10">
                                        {/* Timeline */}
                                        {selectedDispute.timeline && selectedDispute.timeline.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5" /> Audit Timeline
                                                </h4>
                                                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
                                                    {selectedDispute.timeline.map((step, i) => (
                                                        <div key={i} className="pl-8 relative">
                                                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-zinc-950 rounded-full border-2 border-zinc-800 z-10 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                                                            </div>
                                                            <p className="text-xs font-bold text-zinc-200">{step.action.replace(/_/g, " ")}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-0.5">{step.details}</p>
                                                            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-1">{new Date(step.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Board */}
                                        <div className="flex flex-col h-[400px] bg-zinc-900/40 rounded-[2rem] border border-zinc-800/50 overflow-hidden">
                                            <div className="p-5 border-b border-zinc-800/50 bg-white/5 flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Mediation Chat</h4>
                                                <Badge className="bg-purple-500/10 text-purple-400 text-[8px] font-black px-2 py-0.5 rounded-full border-none uppercase tracking-widest">Live Monitoring</Badge>
                                            </div>
                                            
                                            <div id="dispute-messages" className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                                {selectedDispute.messages.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                        <MessageSquare className="w-10 h-10 mb-2" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No communications recorded</p>
                                                    </div>
                                                ) : (
                                                    selectedDispute.messages.map((msg, i) => {
                                                        const isMe = (typeof msg.sender === 'object' ? msg.sender?._id : msg.sender) === userId;
                                                        const isAdmin = msg.senderRole === "admin" || msg.senderRole === "system";
                                                        
                                                        return (
                                                            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1.5`}>
                                                                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500">
                                                                        {isAdmin ? "SmartHire Mediator" : (typeof msg.sender === 'object' ? msg.sender?.fullName : "User")}
                                                                    </p>
                                                                    <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                                                                    isAdmin 
                                                                        ? "bg-purple-500/10 border border-purple-500/20 text-purple-200" 
                                                                        : isMe 
                                                                            ? "bg-red-500/10 border border-red-500/20 text-red-100 rounded-tr-none" 
                                                                            : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-none"
                                                                }`}>
                                                                    {msg.message}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {selectedDispute.status !== "resolved" && selectedDispute.status !== "closed" && (
                                                <div className="p-4 bg-zinc-950 border-t border-zinc-800/50">
                                                    <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 focus-within:border-zinc-700 transition-colors">
                                                        <textarea
                                                            value={message}
                                                            onChange={(e) => setMessage(e.target.value)}
                                                            placeholder="Submit statement..."
                                                            className="bg-transparent text-white text-xs flex-1 px-3 py-2 outline-none resize-none min-h-[44px]"
                                                            rows={1}
                                                        />
                                                        <Button 
                                                            onClick={sendMessage} 
                                                            disabled={sending || !message.trim()} 
                                                            size="icon" 
                                                            className="bg-red-500 hover:bg-red-600 rounded-xl h-10 w-10 shrink-0"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
