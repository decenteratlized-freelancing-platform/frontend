"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Megaphone, Plus, Edit, Trash2, Pin, Calendar } from "lucide-react"

interface Announcement {
    _id: string
    title: string
    content: string
    type: string
    targetAudience: string
    isActive: boolean
    isPinned: boolean
    startDate: string
    endDate?: string
    createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
    info: "bg-blue-500/20 text-blue-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    maintenance: "bg-orange-500/20 text-orange-400",
    update: "bg-green-500/20 text-green-400",
    promotion: "bg-purple-500/20 text-purple-400",
}

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Announcement | null>(null)
    const [form, setForm] = useState({
        title: "",
        content: "",
        type: "info",
        targetAudience: "all",
        isPinned: false,
    })

    const fetchAnnouncements = async (page = 1) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`http://localhost:5000/api/admin/announcements?page=${page}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                setAnnouncements(data.announcements)
                setPagination(data.pagination)
            }
        } catch (err) {
            console.error("Error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const handleSubmit = async () => {
        if (!form.title || !form.content) return

        try {
            const token = localStorage.getItem("adminToken")
            const url = editing
                ? `http://localhost:5000/api/admin/announcements/${editing._id}`
                : "http://localhost:5000/api/admin/announcements"

            const res = await fetch(url, {
                method: editing ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            })

            if (res.ok) {
                setDialogOpen(false)
                setEditing(null)
                setForm({ title: "", content: "", type: "info", targetAudience: "all", isPinned: false })
                fetchAnnouncements(pagination.page)
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this announcement?")) return

        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`http://localhost:5000/api/admin/announcements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                fetchAnnouncements(pagination.page)
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    const handleToggleActive = async (announcement: Announcement) => {
        try {
            const token = localStorage.getItem("adminToken")
            const res = await fetch(`http://localhost:5000/api/admin/announcements/${announcement._id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: !announcement.isActive }),
            })

            if (res.ok) {
                fetchAnnouncements(pagination.page)
            }
        } catch (err) {
            console.error("Error:", err)
        }
    }

    const openEditDialog = (announcement: Announcement) => {
        setEditing(announcement)
        setForm({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            targetAudience: announcement.targetAudience,
            isPinned: announcement.isPinned,
        })
        setDialogOpen(true)
    }

    return (
        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
                    <Megaphone className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">Announcements</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">Platform <span className="text-orange-400">Announcements</span></h1>
                        <p className="text-xl text-gray-300">Create and manage platform-wide notifications</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm({ title: "", content: "", type: "info", targetAudience: "all", isPinned: false }); } }}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="w-4 h-4 mr-2" /> New Announcement
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit" : "Create"} Announcement</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Title</label>
                                    <Input
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        placeholder="Announcement title"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Content</label>
                                    <Textarea
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        rows={4}
                                        placeholder="Announcement content..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Type</label>
                                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-900 border-white/10">
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="update">Update</SelectItem>
                                                <SelectItem value="promotion">Promotion</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Audience</label>
                                        <Select value={form.targetAudience} onValueChange={(v) => setForm({ ...form, targetAudience: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-900 border-white/10">
                                                <SelectItem value="all">All Users</SelectItem>
                                                <SelectItem value="clients">Clients Only</SelectItem>
                                                <SelectItem value="freelancers">Freelancers Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleSubmit} className="w-full bg-orange-500 hover:bg-orange-600">
                                    {editing ? "Update" : "Create"} Announcement
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Announcements List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white">All Announcements ({pagination.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                        ) : announcements.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No announcements yet</p>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((announcement, index) => (
                                    <motion.div
                                        key={announcement._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-xl ${announcement.isActive ? "bg-white/5" : "bg-white/2 opacity-60"} hover:bg-white/10 transition-colors`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {announcement.isPinned && <Pin className="w-4 h-4 text-orange-400" />}
                                                    <h3 className="font-semibold text-white">{announcement.title}</h3>
                                                    <Badge className={TYPE_COLORS[announcement.type]}>{announcement.type}</Badge>
                                                    <Badge variant="outline" className="border-white/20 text-gray-300">{announcement.targetAudience}</Badge>
                                                    {!announcement.isActive && <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>}
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2">{announcement.content}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleToggleActive(announcement)} className="text-gray-400 hover:text-white">
                                                    {announcement.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => openEditDialog(announcement)} className="text-gray-400 hover:text-white">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(announcement._id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
