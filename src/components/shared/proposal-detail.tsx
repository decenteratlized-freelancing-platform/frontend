"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Calendar, Clock, User,
    ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2,
    Briefcase, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProposalDetailProps {
    proposalId: string;
    userRole: "client" | "freelancer";
    userEmail?: string;
}

interface Proposal {
    _id: string;
    coverLetter: string;
    proposedRate: number;
    deliveryTime: string;
    status: string;
    paymentMode: string;
    createdAt: string;
    job: {
        _id: string;
        title: string;
        description: string;
        budget: number;
        paymentCurrency: string;
        client: {
            _id: string;
            fullName: string;
            email: string;
            image?: string;
        };
    };
    freelancer: {
        _id: string;
        fullName: string;
        email: string;
        image?: string;
        skills?: string[];
    };
    contract?: {
        _id: string;
        status: string;
    };
}

export function ProposalDetail({ proposalId, userRole, userEmail }: ProposalDetailProps) {
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch(`${BACKEND_URL}/api/proposals/${proposalId}`);
                if (!res.ok) throw new Error("Proposal not found");
                const data = await res.json();
                setProposal(data);
            } catch (err: any) {
                setError(err.message || "Failed to load proposal");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [proposalId, BACKEND_URL]);

    const handleStatusChange = async (status: "accepted" | "rejected") => {
        if (!proposal) return;
        try {
            setActionLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/proposals/${proposalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, clientEmail: userEmail }),
            });
            if (res.ok) {
                setProposal(prev => prev ? { ...prev, status } : null);
            }
        } catch (err) {
            console.error("Error updating status:", err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-semibold text-white">{error || "Proposal not found"}</h2>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30";
            case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6 space-y-6"
        >
            {/* Back Button */}
            <Button onClick={() => router.back()} variant="ghost" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {/* Proposal Header */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl text-white mb-2">Proposal Details</CardTitle>
                            <p className="text-gray-400">
                                Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge className={getStatusColor(proposal.status)}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Job Reference */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Related Job</h3>
                        <Link href={`/${userRole}/jobs/${proposal.job._id}`} className="group">
                            <h4 className="text-lg text-white font-semibold group-hover:text-blue-400 transition-colors">
                                {proposal.job.title}
                            </h4>
                        </Link>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{proposal.job.description}</p>
                    </div>

                    {/* Freelancer/Client Info */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">
                            {userRole === "client" ? "Freelancer" : "Client"}
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                {userRole === "client"
                                    ? proposal.freelancer?.fullName?.[0] || "?"
                                    : proposal.job.client?.fullName?.[0] || "?"}
                            </div>
                            <div>
                                <h4 className="text-white font-medium">
                                    {userRole === "client" ? proposal.freelancer?.fullName : proposal.job.client?.fullName}
                                </h4>
                                <p className="text-sm text-gray-400">
                                    {userRole === "client" ? proposal.freelancer?.email : proposal.job.client?.email}
                                </p>
                            </div>
                        </div>
                        {userRole === "client" && proposal.freelancer?.skills && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {proposal.freelancer.skills.slice(0, 5).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Proposal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Target className="w-4 h-4" /> Proposed Rate
                            </div>
                            <p className="text-white font-semibold text-lg">
                                {proposal.proposedRate} ETH
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Clock className="w-4 h-4" /> Delivery Time
                            </div>
                            <p className="text-white font-semibold text-lg">{proposal.deliveryTime}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Briefcase className="w-4 h-4" /> Payment Mode
                            </div>
                            <p className="text-white font-semibold text-lg capitalize">{proposal.paymentMode}</p>
                        </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Cover Letter
                        </h3>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-gray-300 whitespace-pre-wrap">{proposal.coverLetter}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {userRole === "client" && proposal.status === "pending" && (
                        <div className="pt-4 border-t border-white/10 flex gap-3">
                            <Button
                                onClick={() => handleStatusChange("accepted")}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Accept Proposal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleStatusChange("rejected")}
                                disabled={actionLoading}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                        </div>
                    )}

                    {/* Contract Link */}
                    {proposal.contract && (
                        <div className="pt-4 border-t border-white/10">
                            <Link href={`/${userRole}/contracts/${proposal.contract._id}`}>
                                <Button variant="outline" className="w-full">
                                    <FileText className="w-4 h-4 mr-2" /> View Contract
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Create Contract Button (for accepted proposals without contract) */}
                    {userRole === "client" && proposal.status === "accepted" && !proposal.contract && (
                        <div className="pt-4 border-t border-white/10">
                            <Link href={`/client/contracts?create=${proposal._id}`}>
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                                    <FileText className="w-4 h-4 mr-2" /> Create Contract
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
