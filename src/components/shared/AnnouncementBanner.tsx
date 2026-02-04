"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Megaphone, AlertTriangle, Info, Wrench, Sparkles, Gift, Pin } from "lucide-react"

interface Announcement {
    _id: string
    title: string
    content: string
    type: "info" | "warning" | "maintenance" | "update" | "promotion"
    isPinned: boolean
    createdAt: string
}

interface AnnouncementBannerProps {
    role: "client" | "freelancer"
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bgClass: string; borderClass: string; iconClass: string }> = {
    info: {
        icon: Info,
        bgClass: "bg-blue-500/10",
        borderClass: "border-blue-500/30",
        iconClass: "text-blue-400"
    },
    warning: {
        icon: AlertTriangle,
        bgClass: "bg-yellow-500/10",
        borderClass: "border-yellow-500/30",
        iconClass: "text-yellow-400"
    },
    maintenance: {
        icon: Wrench,
        bgClass: "bg-orange-500/10",
        borderClass: "border-orange-500/30",
        iconClass: "text-orange-400"
    },
    update: {
        icon: Sparkles,
        bgClass: "bg-green-500/10",
        borderClass: "border-green-500/30",
        iconClass: "text-green-400"
    },
    promotion: {
        icon: Gift,
        bgClass: "bg-purple-500/10",
        borderClass: "border-purple-500/30",
        iconClass: "text-purple-400"
    }
}

export default function AnnouncementBanner({ role }: AnnouncementBannerProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load dismissed announcements from localStorage
        const stored = localStorage.getItem(`dismissed_announcements_${role}`)
        if (stored) {
            try {
                setDismissedIds(new Set(JSON.parse(stored)))
            } catch {
                // Invalid stored data, ignore
            }
        }
    }, [role])

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/announcements?role=${role}`)
                if (res.ok) {
                    const data = await res.json()
                    setAnnouncements(data.announcements || [])
                }
            } catch (err) {
                console.error("Error fetching announcements:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAnnouncements()
    }, [role])

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissedIds)
        newDismissed.add(id)
        setDismissedIds(newDismissed)
        localStorage.setItem(
            `dismissed_announcements_${role}`,
            JSON.stringify(Array.from(newDismissed))
        )
    }

    const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a._id))

    if (loading || visibleAnnouncements.length === 0) {
        return null
    }

    return (
        <div className="space-y-3 mb-6">
            <AnimatePresence>
                {visibleAnnouncements.map((announcement, index) => {
                    const config = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.info
                    const Icon = config.icon

                    return (
                        <motion.div
                            key={announcement._id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-4 rounded-xl border ${config.bgClass} ${config.borderClass} backdrop-blur-sm`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${config.bgClass}`}>
                                    <Icon className={`w-5 h-5 ${config.iconClass}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {announcement.isPinned && (
                                            <Pin className="w-3 h-3 text-orange-400" />
                                        )}
                                        <h4 className="font-semibold text-white text-sm">
                                            {announcement.title}
                                        </h4>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {announcement.content}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDismiss(announcement._id)}
                                    className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                    aria-label="Dismiss announcement"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
