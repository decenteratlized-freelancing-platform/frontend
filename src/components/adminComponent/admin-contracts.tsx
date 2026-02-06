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
import { FileText, Calendar, Users, Wallet } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

interface Contract {
    _id: string
    contractId: string
    status: string
    totalAmount: string
    paymentType: string
    createdAt: string
    job?: { title: string }
    client?: { fullName: string; email: string; image?: string }
    freelancer?: { fullName: string; email: string; image?: string }
    milestones?: Array<{ description: string; amount: string; status: string }>
}

const STATUS_COLORS: Record<string, string> = {
    created: "bg-yellow-500/20 text-yellow-400",
    funded: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    refunded: "bg-orange-500/20 text-orange-400",
    disputed: "bg-red-500/20 text-red-400",
}

export default function AdminContracts() {
    const [contracts, setContracts] = useState<Contract[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

    const fetchContracts = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/contracts?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setContracts(data.contracts)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching contracts:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchContracts()
    }, [statusFilter])

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
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">Contracts Management</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Manage <span className="text-orange-400">Contracts</span>
                </h1>
                <p className="text-xl text-gray-300">View all platform contracts and milestones</p>
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
                        <div className="flex gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Created">Created</SelectItem>
                                    <SelectItem value="Funded">Funded</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Refunded">Refunded</SelectItem>
                                    <SelectItem value="Disputed">Disputed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Contracts List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">
                            Contracts ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                        ) : contracts.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No contracts found</p>
                        ) : (
                            <div className="space-y-4">
                                {contracts.map((contract, index) => (
                                    <motion.div
                                        key={contract._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-white mb-1">
                                                    Contract: {contract.contractId.slice(0, 8)}...
                                                </h3>
                                                <p className="text-sm text-gray-400">{contract.job?.title || "Unknown Job"}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={STATUS_COLORS[contract.status.toLowerCase()] || "bg-gray-500/20 text-gray-400"}>
                                                    {contract.status}
                                                </Badge>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-white flex items-center gap-1">
                                                        <Wallet className="w-4 h-4" />
                                                        {contract.totalAmount}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{contract.paymentType}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    user={{ name: contract.client?.fullName, image: contract.client?.image }}
                                                    className="w-8 h-8"
                                                />
                                                <div>
                                                    <p className="text-xs text-gray-400">Client</p>
                                                    <p className="text-sm text-white">{contract.client?.fullName || "Unknown"}</p>
                                                </div>
                                            </div>
                                            <div className="text-gray-400">→</div>
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    user={{ name: contract.freelancer?.fullName, image: contract.freelancer?.image }}
                                                    className="w-8 h-8"
                                                />
                                                <div>
                                                    <p className="text-xs text-gray-400">Freelancer</p>
                                                    <p className="text-sm text-white">{contract.freelancer?.fullName || "Unknown"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {contract.milestones && contract.milestones.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-xs text-gray-400 mb-2">Milestones ({contract.milestones.length})</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {contract.milestones.map((milestone, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant="outline"
                                                            className="border-white/20 text-gray-300"
                                                        >
                                                            {milestone.description.slice(0, 20)}... - {milestone.amount} ETH ({milestone.status})
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                                            <Calendar className="w-3 h-3" />
                                            Created {new Date(contract.createdAt).toLocaleDateString()}
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
                                    onClick={() => fetchContracts(pagination.page - 1)}
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
                                    onClick={() => fetchContracts(pagination.page + 1)}
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
