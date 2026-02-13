"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Briefcase, Calendar, Clock, MapPin, User,
    ArrowLeft, Tag, Users, CheckCircle, AlertCircle, Loader2,
    FileText, Send, Heart, Target, Zap, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface JobDetailProps {
    jobId: string;
    userRole: "client" | "freelancer";
    userEmail?: string;
}

interface Job {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    skills: string[];
    category: string;
    experienceLevel: string;
    budgetType: string;
    duration: string;
    paymentCurrency: string;
    paymentType: string;
    status: string;
    proposalsCount: number;
    createdAt: string;
    client: {
        _id: string;
        fullName: string;
        email: string;
        image?: string;
    };
}

interface Proposal {
    _id: string;
    coverLetter: string;
    proposedRate: number;
    deliveryTime: string;
    status: string;
    createdAt: string;
    freelancer: {
        _id: string;
        fullName: string;
        email: string;
        image?: string;
        skills?: string[];
    };
}

export function JobDetail({ jobId, userRole, userEmail }: JobDetailProps) {
    const { data: session } = useSession();
    const [job, setJob] = useState<Job | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isTogglingFav, setIsTogglingFav] = useState(false);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const ensureToken = async () => {
        let token = localStorage.getItem("token");
        if (!token && session?.user?.email) {
            try {
                const devRes = await fetch(`${BACKEND_URL}/api/auth/dev-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: session.user.email })
                });
                if (devRes.ok) {
                    const data = await devRes.json();
                    token = data.token;
                    localStorage.setItem("token", token || "");
                }
            } catch (e) { console.error("Auto-token failed", e); }
        }
        return token;
    };

    const fetchFavoriteStatus = async () => {
        const token = await ensureToken();
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/user/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsFavorite(data.jobs?.some((j: any) => j._id === jobId));
            }
        } catch (e) {}
    };

    const toggleFavorite = async () => {
        const token = await ensureToken();
        if (!token) {
            toast({ title: "Auth Required", description: "Log in to save favorites", variant: "destructive" });
            return;
        }
        setIsTogglingFav(true);
        try {
            const endpoint = isFavorite ? "/api/user/favorites/jobs/remove" : "/api/user/favorites/jobs/add";
            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ jobId })
            });
            if (res.ok) {
                setIsFavorite(!isFavorite);
                toast({ title: isFavorite ? "Removed" : "Saved", description: isFavorite ? "Removed from favorites" : "Saved to favorites" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsTogglingFav(false);
        }
    };

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const jobRes = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`);
                if (!jobRes.ok) throw new Error("Job not found");
                const jobData = await jobRes.json();
                setJob(jobData);

                // If client, also fetch proposals for this job
                if (userRole === "client") {
                    const proposalsRes = await fetch(`${BACKEND_URL}/api/proposals/job/${jobId}`);
                    if (proposalsRes.ok) {
                        const proposalsData = await proposalsRes.json();
                        setProposals(proposalsData);
                    }
                }
            } catch (err: any) {
                setError(err.message || "Failed to load job");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        fetchFavoriteStatus();
    }, [jobId, userRole, BACKEND_URL]);

    const handleAcceptProposal = async (proposalId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/proposals/${proposalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "accepted", clientEmail: userEmail }),
            });
            if (res.ok) {
                setProposals(prev => prev.map(p =>
                    p._id === proposalId ? { ...p, status: "accepted" } : p
                ));
            }
        } catch (err) {
            console.error("Error accepting proposal:", err);
        }
    };

    const handleRejectProposal = async (proposalId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/proposals/${proposalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected", clientEmail: userEmail }),
            });
            if (res.ok) {
                setProposals(prev => prev.map(p =>
                    p._id === proposalId ? { ...p, status: "rejected" } : p
                ));
            }
        } catch (err) {
            console.error("Error rejecting proposal:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-semibold text-white">{error || "Job not found"}</h2>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto p-6 space-y-8"
        >
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Button onClick={() => router.back()} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 border border-zinc-800 rounded-xl px-4 py-2 transition-all">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
                </Button>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={toggleFavorite}
                        disabled={isTogglingFav}
                        className={`rounded-xl border-zinc-800 transition-all h-10 w-10 ${isFavorite ? "bg-pink-500/10 border-pink-500/50 text-pink-500" : "bg-zinc-900/50 text-zinc-500 hover:text-pink-400 hover:border-pink-500/30"}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-zinc-800 h-10 w-10 bg-zinc-900/50 text-zinc-500">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Job Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12 space-y-10">
                    {/* Title and Client Section */}
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-none px-4 py-1 text-[10px] font-black tracking-widest uppercase rounded-full">
                                {job.category || "Project"}
                            </Badge>
                            <span className="text-zinc-700 text-sm font-bold">/</span>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                Verified Opportunity
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight">
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-5 py-2.5 rounded-2xl">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black border border-zinc-700 text-white">
                                    {job.client?.fullName?.[0]}
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Posted By</p>
                                    <p className="text-sm text-white font-bold">{job.client?.fullName || "Verified Client"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                    <Calendar className="w-5 h-5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Posted On</p>
                                    <p className="text-sm text-white font-bold">{new Date(job.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-700 transition-all">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Budget</p>
                            <p className="text-xl font-black text-white">{job.budget} ETH</p>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-700 transition-all">
                            <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20 mb-4">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-xl font-black text-white">{job.duration || "Not specified"}</p>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-700 transition-all">
                            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 mb-4">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Proposals</p>
                            <p className="text-xl font-black text-white">{job.proposalsCount}</p>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-700 transition-all">
                            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20 mb-4">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Experience</p>
                            <p className="text-xl font-black text-white">{job.experienceLevel || "Any"}</p>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
                            <div className="h-px w-8 bg-zinc-800" />
                            Project Scope & Goals
                        </h3>
                        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 md:p-10">
                            <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                {job.description}
                            </p>
                        </div>
                    </div>

                    {/* Skills Section */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
                                <div className="h-px w-8 bg-zinc-800" />
                                Required Technical Skills
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {job.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300 px-5 py-2.5 text-xs font-bold rounded-2xl hover:border-zinc-600 transition-all">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Footer */}
                    {userRole === "freelancer" && job.status === "open" && (
                        <div className="pt-10 border-t border-zinc-800 flex justify-center">
                            <Link href={`/freelancer/browse-jobs?apply=${job._id}`}>
                                <Button className="h-16 px-12 bg-white hover:bg-zinc-200 text-black text-lg font-black rounded-3xl shadow-2xl shadow-white/5 transition-all flex items-center gap-3">
                                    <Send className="w-5 h-5" /> Submit Proposal for Project
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Proposals Section (Client Only) */}
            {userRole === "client" && proposals.length > 0 && (
                <div className="space-y-6 pt-8">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4">
                        Received Proposals
                        <span className="text-sm bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-bold">{proposals.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {proposals.map((proposal) => (
                            <div
                                key={proposal._id}
                                className="bg-zinc-900/20 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-900/40 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-black text-xl">
                                            {proposal.freelancer?.fullName?.[0] || "?"}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{proposal.freelancer?.fullName}</h4>
                                            <p className="text-sm text-zinc-500 font-medium">{proposal.freelancer?.email}</p>
                                        </div>
                                    </div>
                                    <Badge className={`px-4 py-1.5 rounded-xl font-black text-[10px] tracking-widest uppercase border-none ${
                                        proposal.status === "accepted" ? "bg-emerald-600 text-white" :
                                            proposal.status === "rejected" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"
                                    }`}>
                                        {proposal.status}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-zinc-800/50">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Proposed Rate</p>
                                        <p className="text-lg font-bold text-white">{proposal.proposedRate} ETH</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Delivery Time</p>
                                        <p className="text-lg font-bold text-white">{proposal.deliveryTime}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Cover Letter</p>
                                    <p className="text-zinc-300 leading-relaxed line-clamp-4">{proposal.coverLetter}</p>
                                </div>

                                {proposal.status === "pending" && (
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <Button
                                            onClick={() => handleAcceptProposal(proposal._id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-6"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Accept Proposal
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleRejectProposal(proposal._id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold rounded-2xl px-6"
                                        >
                                            Reject
                                        </Button>
                                        <Link href={`/${userRole}/proposals/${proposal._id}`}>
                                            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white rounded-2xl px-6">View Details</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
