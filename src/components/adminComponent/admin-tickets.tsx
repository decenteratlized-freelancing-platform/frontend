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
import { Headphones, MessageSquare, Clock, CheckCircle, Calendar, Send } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

interface Ticket {
    _id: string
    ticketId: string
    subject: string
    category: string
    priority: string
    status: string
    createdAt: string
    messages: Array<{ message: string; senderRole: string; createdAt: string }>
    user?: { fullName: string; email: string; image?: string; role: string }
}

const STATUS_COLORS: Record<string, string> = {
    open: "bg-red-500/20 text-red-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    waiting_response: "bg-yellow-500/20 text-yellow-400",
    resolved: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
}

const PRIORITY_COLORS: Record<string, string> = {
    low: "bg-blue-500/20 text-blue-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    urgent: "bg-red-500/20 text-red-400",
}

export default function AdminTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [reply, setReply] = useState("")
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 })

    const fetchTickets = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/tickets?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setTickets(data.tickets)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching tickets:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/tickets/stats/overview`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    useEffect(() => {
        fetchTickets()
        fetchStats()
    }, [statusFilter])

    const handleReply = async () => {
        if (!selectedTicket || !reply.trim()) return

        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/tickets/${selectedTicket._id}/reply`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: reply }),
            })

            if (res.ok) {
                setReply("")
                fetchTickets(pagination.page)
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    const handleUpdateStatus = async (ticketId: string, status: string) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/tickets/${ticketId}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            })

            if (res.ok) {
                fetchTickets(pagination.page)
                fetchStats()
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    const statCards = [
        { title: "Total", value: stats.total, icon: Headphones, color: "from-purple-500 to-pink-500" },
        { title: "Open", value: stats.open, icon: MessageSquare, color: "from-red-500 to-orange-500" },
        { title: "In Progress", value: stats.inProgress, icon: Clock, color: "from-blue-500 to-cyan-500" },
        { title: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
    ]

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
                    <Headphones className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Support Tickets</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Support <span className="text-purple-400">Tickets</span></h1>
                <p className="text-xl text-gray-300">Manage user support requests</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-white">Tickets ({pagination.total})</CardTitle>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10">
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No tickets found</p>
                                ) : (
                                    <div className="space-y-2">
                                        {tickets.map((ticket, index) => (
                                            <motion.div
                                                key={ticket._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedTicket(ticket)}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedTicket?._id === ticket._id ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500">{ticket.ticketId}</span>
                                                    <Badge className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
                                                </div>
                                                <p className="font-medium text-white text-sm truncate">{ticket.subject}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-400">{ticket.user?.fullName}</span>
                                                    <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Ticket Details */}
                <div className="lg:col-span-1">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 h-[600px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">
                                    {selectedTicket ? "Ticket Details" : "Select a Ticket"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                {selectedTicket ? (
                                    <>
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserAvatar user={{ name: selectedTicket.user?.fullName, image: selectedTicket.user?.image }} className="w-8 h-8" />
                                                <div>
                                                    <p className="text-sm font-medium text-white">{selectedTicket.user?.fullName}</p>
                                                    <p className="text-xs text-gray-400">{selectedTicket.user?.email}</p>
                                                </div>
                                            </div>
                                            <p className="text-white font-medium">{selectedTicket.subject}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" onClick={() => handleUpdateStatus(selectedTicket._id, "in_progress")} className="bg-blue-500 hover:bg-blue-600">
                                                    In Progress
                                                </Button>
                                                <Button size="sm" onClick={() => handleUpdateStatus(selectedTicket._id, "resolved")} className="bg-green-500 hover:bg-green-600">
                                                    Resolve
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                            {selectedTicket.messages.map((msg, i) => (
                                                <div key={i} className={`p-2 rounded-lg text-sm ${msg.senderRole === "admin" ? "bg-purple-500/20 ml-4" : "bg-white/10 mr-4"}`}>
                                                    <p className="text-white">{msg.message}</p>
                                                    <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <Textarea
                                                value={reply}
                                                onChange={(e) => setReply(e.target.value)}
                                                placeholder="Type your reply..."
                                                className="bg-white/5 border-white/10 text-white text-sm flex-1"
                                                rows={2}
                                            />
                                            <Button onClick={handleReply} className="bg-purple-500 hover:bg-purple-600">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-center">Click on a ticket to view details</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
