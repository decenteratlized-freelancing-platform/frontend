"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Calendar, DollarSign, User,
    ArrowLeft, CheckCircle, AlertCircle, Loader2,
    Briefcase, Target, Clock, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ContractDetailProps {
    contractId: string;
    userRole: "client" | "freelancer";
    userEmail?: string;
}

interface Milestone {
    _id: string;
    description: string;
    amount: string;
    status: string;
}

interface Contract {
    _id: string;
    contractId: string;
    onchainId: string;
    status: string;
    paymentType: string;
    totalAmount: number;
    createdAt: string;
    job: {
        _id: string;
        title: string;
        description: string;
        deadline: string;
        budget: number;
    };
    client: {
        _id: string;
        fullName: string;
        email: string;
        image?: string;
        walletAddress?: string;
    };
    freelancer: {
        _id: string;
        fullName: string;
        email: string;
        image?: string;
        walletAddress?: string;
    };
    milestones: Milestone[];
}

export function ContractDetail({ contractId, userRole, userEmail }: ContractDetailProps) {
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch(`${BACKEND_URL}/api/contracts/${contractId}`);
                if (!res.ok) throw new Error("Contract not found");
                const data = await res.json();
                setContract(data);
            } catch (err: any) {
                setError(err.message || "Failed to load contract");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [contractId, BACKEND_URL]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-semibold text-white">{error || "Contract not found"}</h2>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "created": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "completed": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            case "disputed": return "bg-red-500/20 text-red-400 border-red-500/30";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getMilestoneStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return "bg-yellow-500/20 text-yellow-400";
            case "in_progress": return "bg-blue-500/20 text-blue-400";
            case "completed": return "bg-green-500/20 text-green-400";
            case "approved": return "bg-purple-500/20 text-purple-400";
            default: return "bg-gray-500/20 text-gray-400";
        }
    };

    const completedMilestones = contract.milestones?.filter(m =>
        m.status === "completed" || m.status === "approved"
    ).length || 0;
    const totalMilestones = contract.milestones?.length || 1;
    const progress = (completedMilestones / totalMilestones) * 100;

    const otherParty = userRole === "client" ? contract.freelancer : contract.client;

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

            {/* Contract Header */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl text-white mb-2">
                                Contract for: {contract.job?.title || "Unknown Job"}
                            </CardTitle>
                            <p className="text-gray-400 text-sm">
                                Contract ID: {contract.contractId.slice(0, 8)}...
                            </p>
                            <p className="text-gray-400 text-sm">
                                Created {new Date(contract.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge className={getStatusColor(contract.status)}>
                            {contract.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">{completedMilestones} / {totalMilestones} milestones</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Contract Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <DollarSign className="w-4 h-4" /> Total Amount
                            </div>
                            <p className="text-white font-semibold text-xl">
                                {contract.paymentType === "crypto"
                                    ? `${contract.totalAmount} ETH`
                                    : `₹${contract.totalAmount?.toLocaleString()}`}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Briefcase className="w-4 h-4" /> Payment Type
                            </div>
                            <p className="text-white font-semibold text-xl capitalize">{contract.paymentType}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Calendar className="w-4 h-4" /> Deadline
                            </div>
                            <p className="text-white font-semibold text-xl">
                                {contract.job?.deadline
                                    ? new Date(contract.job.deadline).toLocaleDateString()
                                    : "Flexible"}
                            </p>
                        </div>
                    </div>

                    {/* Other Party Info */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">
                            {userRole === "client" ? "Freelancer" : "Client"}
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                    {otherParty?.fullName?.[0] || "?"}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{otherParty?.fullName}</h4>
                                    <p className="text-sm text-gray-400">{otherParty?.email}</p>
                                </div>
                            </div>
                            {otherParty?.walletAddress && (
                                <Badge variant="outline" className="text-xs">
                                    Wallet: {otherParty.walletAddress.slice(0, 6)}...{otherParty.walletAddress.slice(-4)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Target className="w-5 h-5" /> Milestones ({contract.milestones?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {contract.milestones?.map((milestone, idx) => (
                            <div
                                key={milestone._id}
                                className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${milestone.status === "completed" || milestone.status === "approved"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-white/10 text-gray-400"
                                        }`}>
                                        {milestone.status === "completed" || milestone.status === "approved"
                                            ? <CheckCircle className="w-4 h-4" />
                                            : idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{milestone.description}</h4>
                                        <p className="text-sm text-gray-400">
                                            {contract.paymentType === "crypto"
                                                ? `${milestone.amount} ETH`
                                                : `₹${parseFloat(milestone.amount).toLocaleString()}`}
                                        </p>
                                    </div>
                                </div>
                                <Badge className={getMilestoneStatusColor(milestone.status)}>
                                    {milestone.status.replace("_", " ")}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                        <Link href={`/${userRole}/jobs/${contract.job?._id}`}>
                            <Button variant="outline">
                                <Briefcase className="w-4 h-4 mr-2" /> View Job
                            </Button>
                        </Link>
                        <Link href={`/${userRole}/disputes?contractId=${contract._id}`}>
                            <Button variant="outline" className="text-orange-400 border-orange-400/30 hover:bg-orange-500/10">
                                <AlertTriangle className="w-4 h-4 mr-2" /> Raise Dispute
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
