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
import { FileText, Clock, Activity, User, AlertCircle } from "lucide-react"

interface AuditLog {
    _id: string
    action: string
    performedByRole: string
    targetType: string
    details?: any
    ipAddress?: string
    createdAt: string
    performedBy?: { fullName: string; email: string }
}

const ACTION_COLORS: Record<string, string> = {
    user_created: "bg-green-500/20 text-green-400",
    user_updated: "bg-blue-500/20 text-blue-400",
    user_deleted: "bg-red-500/20 text-red-400",
    user_verified: "bg-purple-500/20 text-purple-400",
    job_created: "bg-cyan-500/20 text-cyan-400",
    dispute_resolved: "bg-emerald-500/20 text-emerald-400",
    admin_login: "bg-yellow-500/20 text-yellow-400",
}

const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState("all")
    const [targetFilter, setTargetFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [stats, setStats] = useState({ total: 0, todayCount: 0, byAction: [] as any[] })
    const [actions, setActions] = useState<string[]>([])

    const fetchLogs = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "30",
                ...(actionFilter !== "all" && { action: actionFilter }),
                ...(targetFilter !== "all" && { targetType: targetFilter }),
            })

            const res = await fetch(`http://localhost:5000/api/admin/audit-logs?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching logs:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch("http://localhost:5000/api/admin/audit-logs/stats", {
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

    const fetchActions = async () => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch("http://localhost:5000/api/admin/audit-logs/actions", {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setActions(data)
            }
        } catch (err) {
            console.error("Error fetching actions:", err)
        }
    }

    useEffect(() => {
        fetchLogs()
        fetchStats()
        fetchActions()
    }, [actionFilter, targetFilter])

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
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Audit Logs</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Audit <span className="text-blue-400">Logs</span>
                </h1>
                <p className="text-xl text-gray-300">Track all platform activity and admin actions</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-sm text-gray-400">Total Events</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.todayCount}</p>
                                <p className="text-sm text-gray-400">Today's Events</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{actions.length}</p>
                                <p className="text-sm text-gray-400">Action Types</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by action" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10 max-h-60">
                                    <SelectItem value="all">All Actions</SelectItem>
                                    {actions.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {formatAction(action)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={targetFilter} onValueChange={setTargetFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by target" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Targets</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="job">Job</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="dispute">Dispute</SelectItem>
                                    <SelectItem value="settings">Settings</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Logs List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">
                            Activity Log ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        ) : logs.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No audit logs found</p>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge className={ACTION_COLORS[log.action] || "bg-gray-500/20 text-gray-400"}>
                                                {formatAction(log.action)}
                                            </Badge>
                                            <div>
                                                <p className="text-sm text-white">
                                                    {log.performedBy?.fullName || log.performedByRole}
                                                </p>
                                                {log.targetType && (
                                                    <p className="text-xs text-gray-400">Target: {log.targetType}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                            <span>{new Date(log.createdAt).toLocaleString()}</span>
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
                                    onClick={() => fetchLogs(pagination.page - 1)}
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
                                    onClick={() => fetchLogs(pagination.page + 1)}
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
