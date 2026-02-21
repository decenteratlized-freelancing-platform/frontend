"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyLogo } from "../shared/currency-logo"
import { Download, CreditCard, ArrowDownLeft, Calendar, Wallet } from "lucide-react"

interface Transaction {
  _id: string
  id?: string
  description?: string
  amount: string
  paymentCurrency?: string
  status: string
  createdAt: string
  mode: string
  client: { fullName: string }
  job: { title: string }
}

export default function FreelancerTransactions() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { getFormattedAmount } = useCurrency();

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = session?.accessToken || session?.user?.token;
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setTransactions(data)
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
      } finally {
        setLoading(false)
      }
    }

    if (session) fetchTransactions()
  }, [session])

  const totalEarned = transactions
    .filter(t => t.status === "Paid")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const pendingAmount = transactions
    .filter(t => t.status === "Pending")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const stats = [
    { title: "Total Earned", value: getFormattedAmount(totalEarned, transactions[0]?.paymentCurrency || "ETH"), change: "+0%", color: "from-green-500 to-emerald-500" },
    { title: "This Month", value: getFormattedAmount(totalEarned, transactions[0]?.paymentCurrency || "ETH"), change: "+0%", color: "from-blue-500 to-cyan-500" },
    { title: "Pending", value: getFormattedAmount(pendingAmount, transactions[0]?.paymentCurrency || "ETH"), change: "0%", color: "from-orange-500 to-yellow-500" },
    { title: "Transactions", value: transactions.length.toString(), change: "+0%", color: "from-purple-500 to-pink-500" },
  ]

  if (loading) return <div className="p-8 text-center text-white">Loading transactions...</div>

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
          <CreditCard className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Earnings History</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Transactions
          </span>
        </h1>
        <p className="text-xl text-gray-300">Track your earnings and payment history</p>
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
                    <div className="flex items-center gap-2 mt-2">
                      {index < 3 && <CurrencyLogo currency={transactions[0]?.paymentCurrency || "ETH"} size={18} />}
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <p className="text-sm text-green-400 mt-1">{stat.change} from last month</p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white">Recent Earnings</CardTitle>
              <Button className="bg-white/90 text-black hover:bg-white/10 hover:text-black">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No transactions found.</div>
              ) : (
                transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <ArrowDownLeft className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">
                            {transaction.job?.title || "Payment Received"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-100" />
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                            <span>ID: {transaction._id.substring(0, 8)}</span>
                            <span>{transaction.mode}</span>
                            <span>Client: {transaction.client?.fullName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1">
                          <CurrencyLogo currency={transaction.paymentCurrency || "ETH"} size={16} />
                          <p className="text-xl font-bold text-green-400">+{getFormattedAmount(parseFloat(transaction.amount), transaction.paymentCurrency || "ETH")}</p>
                        </div>
                        <Badge
                          variant={transaction.status === "Paid" ? "default" : "secondary"}
                          className={
                            transaction.status === "Paid"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
