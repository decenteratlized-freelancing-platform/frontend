"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Briefcase, Star, MapPin, Search, Loader2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCurrency } from "@/context/CurrencyContext"
import { useSession } from "next-auth/react"

interface FavoritesViewProps {
    userRole: "client" | "freelancer";
}

export function FavoritesView({ userRole }: FavoritesViewProps) {
    const { data: session, status } = useSession()
    const [favorites, setFavorites] = useState<{ freelancers: any[], jobs: any[] }>({ freelancers: [], jobs: [] })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const { getConvertedAmount } = useCurrency()

    const fetchFavorites = async () => {
        if (status === "loading") return;
        
        try {
            setLoading(true)
            let token = localStorage.getItem("token")
            
            // Dev Fix: Auto-get token if missing but session exists
            if (!token && session?.user?.email) {
                try {
                    const devRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/dev-token`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: session.user.email })
                    });
                    if (devRes.ok) {
                        const data = await devRes.json();
                        token = data.token;
                        localStorage.setItem("token", token || "");
                    }
                } catch (e) { console.error("Dev token fetch failed", e); }
            }

            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setFavorites(data)
            }
        } catch (error) {
            console.error("Error fetching favorites:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFavorites()
    }, [session, status])

    const toggleFreelancerFavorite = async (freelancerId: string) => {
        try {
            const token = localStorage.getItem("token")
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/favorites/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ freelancerId })
            })
            setFavorites(prev => ({
                ...prev,
                freelancers: prev.freelancers.filter(f => f._id !== freelancerId)
            }))
        } catch (error) {
            console.error("Error removing favorite:", error)
        }
    }

    const toggleJobFavorite = async (jobId: string) => {
        try {
            const token = localStorage.getItem("token")
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/favorites/jobs/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ jobId })
            })
            setFavorites(prev => ({
                ...prev,
                jobs: prev.jobs.filter(j => j._id !== jobId)
            }))
        } catch (error) {
            console.error("Error removing favorite:", error)
        }
    }

    const filteredFreelancers = (favorites.freelancers || []).filter(f => {
        if (!f) return false;
        const nameMatch = f.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let skillsMatch = false;
        if (typeof f.settings?.skills === "string") {
            skillsMatch = f.settings.skills.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (Array.isArray(f.settings?.skills)) {
            skillsMatch = f.settings.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        return nameMatch || skillsMatch;
    })

    const filteredJobs = (favorites.jobs || []).filter(j => {
        if (!j) return false;
        return j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.category?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">My <span className="text-pink-500">Favorites</span></h1>
                    <p className="text-zinc-400">Manage your saved freelancers and opportunities</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input 
                        placeholder="Search favorites..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white focus:ring-pink-500/20"
                    />
                </div>
            </div>

            <Tabs defaultValue={userRole === "client" ? "freelancers" : "jobs"} className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="freelancers" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg transition-all">
                        Freelancers ({filteredFreelancers.length})
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg transition-all">
                        Jobs ({filteredJobs.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="freelancers" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredFreelancers.map((freelancer) => (
                                <motion.div
                                    key={freelancer._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleFreelancerFavorite(freelancer._id)}
                                            className="absolute top-4 right-4 z-10 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10 rounded-full"
                                        >
                                            <Heart className="w-5 h-5 fill-current" />
                                        </Button>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <UserAvatar 
                                                    user={{ 
                                                        name: freelancer.fullName, 
                                                        image: freelancer.image 
                                                    }} 
                                                    className="w-16 h-16 border-2 border-white/10" 
                                                />
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-pink-400 transition-colors">{freelancer.fullName}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                        <span>{freelancer.settings?.rating || 0} ({freelancer.settings?.reviewsCount || 0} reviews)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-1.5 mb-4 h-7 overflow-hidden">
                                                {(freelancer.settings?.skills || "").split(",").slice(0, 3).map((skill: string) => (
                                                    skill.trim() && (
                                                        <Badge key={skill} variant="secondary" className="bg-white/10 text-zinc-300 text-[10px] uppercase border-none">
                                                            {skill.trim()}
                                                        </Badge>
                                                    )
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="text-sm font-bold text-white">
                                                    {getConvertedAmount(freelancer.settings?.hourlyRate || 0)}/hr
                                                </div>
                                                <Link href={`/${userRole}/messages?receiverId=${freelancer._id}`}>
                                                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white hover:text-black transition-all">
                                                        Contact
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {filteredFreelancers.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500">No favorite freelancers found.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="jobs" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.map((job) => (
                                <motion.div
                                    key={job._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleJobFavorite(job._id)}
                                            className="absolute top-4 right-4 z-10 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10 rounded-full"
                                        >
                                            <Heart className="w-5 h-5 fill-current" />
                                        </Button>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <Badge className="bg-blue-500/10 text-blue-400 border-none mb-2 uppercase text-[10px] tracking-wider">
                                                        {job.category || "General"}
                                                    </Badge>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">{job.title}</h3>
                                                </div>
                                            </div>

                                            <p className="text-zinc-400 text-sm line-clamp-2 mb-6">
                                                {job.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Budget</p>
                                                        <p className="text-white font-bold">{getConvertedAmount(job.budget)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Posted By</p>
                                                        <p className="text-white text-sm">{job.client?.fullName || "Client"}</p>
                                                    </div>
                                                </div>
                                                <Link href={`/${userRole}/jobs/${job._id}`}>
                                                    <Button className="bg-white text-black hover:bg-zinc-200">
                                                        View Job <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {filteredJobs.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500">No favorite jobs found.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}