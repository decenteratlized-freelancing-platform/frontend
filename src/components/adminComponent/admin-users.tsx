"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Search, MoreVertical, UserCircle, Mail, Calendar, Shield, Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"

interface User {
    _id: string
    fullName: string
    email: string
    role: string
    image?: string
    isVerified: boolean
    createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
    client: "bg-blue-500/20 text-blue-400",
    freelancer: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    admin: "bg-purple-500/20 text-purple-400",
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

    const fetchUsers = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(roleFilter !== "all" && { role: roleFilter }),
                ...(search && { search }),
            })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setUsers(data.users)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error fetching users:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [roleFilter])

    const handleSearch = () => {
        setLoading(true)
        fetchUsers(1)
    }

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/users/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: newRole }),
            })

            if (res.ok) {
                fetchUsers(pagination.page)
            }
        } catch (err) {
            console.error("Error updating user:", err)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                fetchUsers(pagination.page)
            }
        } catch (err) {
            console.error("Error deleting user:", err)
        }
    }

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
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">User Management</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    Manage <span className="text-blue-400">Users</span>
                </h1>
                <p className="text-xl text-gray-300">View and manage all platform users</p>
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
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="client">Clients</SelectItem>
                                    <SelectItem value="freelancer">Freelancers</SelectItem>
                                    {/* <SelectItem value="pending">Pending</SelectItem> */}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-white">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                            <span>Users ({pagination.total})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No users found</p>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user, index) => (
                                    <motion.div
                                        key={user._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <UserAvatar user={{ name: user.fullName, image: user.image }} className="w-10 h-10" />
                                            <div>
                                                <p className="font-medium text-white">{user.fullName}</p>
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge className={ROLE_COLORS[user.role] || "bg-gray-500/20 text-gray-400"}>
                                                {user.role}
                                            </Badge>
                                            <div className="text-sm text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-zinc-100" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-gray-900 border-white/10">
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateRole(user._id, "client")}
                                                        className="text-white hover:bg-white/10"
                                                    >
                                                        <UserCircle className="w-4 h-4 mr-2" />
                                                        Set as Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateRole(user._id, "freelancer")}
                                                        className="text-white hover:bg-white/10"
                                                    >
                                                        <UserCircle className="w-4 h-4 mr-2" />
                                                        Set as Freelancer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                                    onClick={() => fetchUsers(pagination.page - 1)}
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
                                    onClick={() => fetchUsers(pagination.page + 1)}
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
