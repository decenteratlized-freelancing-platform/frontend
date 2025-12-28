"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyToggle from "@/components/shared/currency-toggle";
import { Search, Filter, Download, CreditCard, ArrowUpRight, ArrowDownLeft, Calendar, DollarSign } from "lucide-react"

const transactions = [
  {
    id: "TXN-001",
    type: "payment",
    description: "Payment to John Doe - React Development",
    amount: -2500 * 80,
    status: "completed",
    date: "2024-01-15",
    method: "Credit Card",
    freelancer: "John Doe",
  },
  {
    id: "TXN-002",
    type: "refund",
    description: "Refund for cancelled project",
    amount: 800 * 80,
    status: "completed",
    date: "2024-01-12",
    method: "Bank Transfer",
    freelancer: "Jane Smith",
  },
  {
    id: "TXN-003",
    type: "payment",
    description: "Payment to Mike Johnson - UI/UX Design",
    amount: -1800 * 80,
    status: "pending",
    date: "2024-01-10",
    method: "PayPal",
    freelancer: "Mike Johnson",
  },
  {
    id: "TXN-004",
    type: "payment",
    description: "Payment to Sarah Wilson - Content Writing",
    amount: -600 * 80,
    status: "completed",
    date: "2024-01-08",
    method: "Crypto",
    freelancer: "Sarah Wilson",
  },
]

export default function ClientTransactions() {
  const { getConvertedAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const stats = [
    { title: "Total Spent", value: getConvertedAmount(1960000), change: "+12%", color: "from-red-500 to-pink-500" },
    { title: "This Month", value: getConvertedAmount(256000), change: "+8%", color: "from-blue-500 to-cyan-500" },
    { title: "Pending", value: getConvertedAmount(144000), change: "-5%", color: "from-orange-500 to-yellow-500" },
    { title: "Transactions", value: "156", change: "+15%", color: "from-green-500 to-emerald-500" },
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
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <CreditCard className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Transaction History</span>
          </div>
          <CurrencyToggle />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Transactions
          </span>
        </h1>
        <p className="text-xl text-gray-300">Track your payments and financial activity</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-sm text-green-400 mt-1">{stat.change} from last month</p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          transaction.amount > 0
                            ? "bg-gradient-to-br from-green-500 to-emerald-500"
                            : "bg-gradient-to-br from-red-500 to-pink-500"
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowDownLeft className="w-6 h-6 text-white" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {transaction.date}
                          </span>
                          <span>ID: {transaction.id}</span>
                          <span>{transaction.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${transaction.amount > 0 ? "text-green-400" : "text-white"}`}>
                        {transaction.amount > 0 ? "+" : ""}{getConvertedAmount(Math.abs(transaction.amount))}
                      </p>
                      <Badge
                        variant={transaction.status === "completed" ? "default" : "secondary"}
                        className={
                          transaction.status === "completed"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : transaction.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}