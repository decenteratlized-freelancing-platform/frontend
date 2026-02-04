"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Briefcase, Calendar, Clock, MapPin, User,
    ArrowLeft, Tag, Users, CheckCircle, AlertCircle, Loader2,
    FileText, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    const [job, setJob] = useState<Job | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
            className="max-w-5xl mx-auto p-6 space-y-6"
        >
            {/* Back Button */}
            <Button onClick={() => router.back()} variant="ghost" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {/* Job Header */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl text-white mb-2">{job.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {job.client?.fullName || "Unknown Client"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Posted {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {job.proposalsCount} proposals
                                </span>
                            </div>
                        </div>
                        <Badge variant={job.status === "open" ? "default" : "secondary"}>
                            {job.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Target className="w-4 h-4" /> Budget
                            </div>
                            <p className="text-white font-semibold">
                                {job.budget} ETH
                            </p>
                            <p className="text-xs text-gray-500">{job.budgetType}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Clock className="w-4 h-4" /> Duration
                            </div>
                            <p className="text-white font-semibold">{job.duration || "Not specified"}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Calendar className="w-4 h-4" /> Deadline
                            </div>
                            <p className="text-white font-semibold">
                                {job.deadline ? new Date(job.deadline).toLocaleDateString() : "Flexible"}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Briefcase className="w-4 h-4" /> Experience
                            </div>
                            <p className="text-white font-semibold">{job.experienceLevel || "Any"}</p>
                        </div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <Tag className="w-5 h-5" /> Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {userRole === "freelancer" && job.status === "open" && (
                        <div className="pt-4 border-t border-white/10">
                            <Link href={`/freelancer/browse-jobs?apply=${job._id}`}>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">
                                    <Send className="w-4 h-4 mr-2" /> Submit Proposal
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Proposals Section (Client Only) */}
            {userRole === "client" && proposals.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Proposals ({proposals.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {proposals.map((proposal) => (
                            <div
                                key={proposal._id}
                                className="bg-white/5 rounded-lg p-4 border border-white/10"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                            {proposal.freelancer?.fullName?.[0] || "?"}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{proposal.freelancer?.fullName}</h4>
                                            <p className="text-sm text-gray-400">{proposal.freelancer?.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        proposal.status === "accepted" ? "default" :
                                            proposal.status === "rejected" ? "destructive" : "secondary"
                                    }>
                                        {proposal.status}
                                    </Badge>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Proposed Rate:</span>
                                        <span className="text-white ml-2 font-medium">
                                            {proposal.proposedRate} ETH
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Delivery:</span>
                                        <span className="text-white ml-2 font-medium">{proposal.deliveryTime}</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-gray-300 text-sm line-clamp-3">{proposal.coverLetter}</p>
                                {proposal.status === "pending" && (
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAcceptProposal(proposal._id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRejectProposal(proposal._id)}
                                        >
                                            Reject
                                        </Button>
                                        <Link href={`/${userRole}/proposals/${proposal._id}`}>
                                            <Button size="sm" variant="outline">View Details</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
}
