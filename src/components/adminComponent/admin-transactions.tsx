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
import { CreditCard, Calendar, ArrowRight, Wallet } from "lucide-react"

interface Transaction {
    _id: string
    amount: string
    status: string
    mode: string
    txHash?: string
    createdAt: string
    job?: { title: string }
    contract?: { contractId: string }
    client?: { fullName: string; email: string }
    freelancer?: { fullName: string; email: string }
}

const STATUS_COLORS: Record<string, string> = {
    Pending: "bg-yellow-500/20 text-yellow-400",
    Paid: "bg-green-500/20 text-green-400",
    Failed: "bg-red-500/20 text-red-400",
    Refunded: "bg-orange-500/20 text-orange-400",
}

const MODE_COLORS: Record<string, string> = {
    crypto: "bg-purple-500/20 text-purple-400",
    bank: "bg-blue-500/20 text-blue-400",
}

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [modeFilter, setModeFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

    const fetchTransactions = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(modeFilter !== "all" && { mode: modeFilter }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/transactions?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setTransactions(data.transactions)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching transactions:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [statusFilter, modeFilter])

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
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-white">Transactions</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Platform <span className="text-indigo-400">Transactions</span>
                </h1>
                <p className="text-xl text-gray-300">View all payment transactions</p>
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
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                    <SelectItem value="Refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={modeFilter} onValueChange={setModeFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Modes</SelectItem>
                                    <SelectItem value="crypto">Crypto</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Transactions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">
                            Transactions ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No transactions found</p>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx, index) => (
                                    <motion.div
                                        key={tx._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-white">{tx.job?.title || "Unknown Job"}</p>
                                                <p className="text-xs text-gray-400">
                                                    Contract: {tx.contract?.contractId?.slice(0, 8) || "N/A"}...
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={MODE_COLORS[tx.mode] || "bg-gray-500/20 text-gray-400"}>
                                                    <Wallet className="w-3 h-3 mr-1" />
                                                    {tx.mode}
                                                </Badge>
                                                <Badge className={STATUS_COLORS[tx.status] || "bg-gray-500/20 text-gray-400"}>
                                                    {tx.status}
                                                </Badge>
                                                <p className="text-lg font-bold text-white flex items-center gap-1">
                                                    <Wallet className="w-4 h-4" />
                                                    <span>{tx.amount} ETH</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-gray-400">
                                                <span className="text-gray-500">From:</span> {tx.client?.fullName || "Unknown"}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-500" />
                                            <div className="text-gray-400">
                                                <span className="text-gray-500">To:</span> {tx.freelancer?.fullName || "Unknown"}
                                            </div>
                                            <div className="ml-auto flex items-center gap-1 text-gray-500">
                                                <Calendar className="w-3 h-3 text-zinc-100" />
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {tx.txHash && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                TX Hash: {tx.txHash.slice(0, 20)}...
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchTransactions(pagination.page - 1)}
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
                                    onClick={() => fetchTransactions(pagination.page + 1)}
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
