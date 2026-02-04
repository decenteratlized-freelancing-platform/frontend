"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Calendar, DollarSign, User,
    ArrowLeft, CheckCircle, AlertCircle, Loader2,
    Briefcase, Target, Clock, AlertTriangle,
    RefreshCw, Wallet, Send, Edit, Plus, Trash2, Save, X, ThumbsUp,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

const ESCROW_ADDRESS = "0x41fE53C6963a87006Fb59177CE1136b86a9B7297"; // SmartHireEscrowV2
const ESCROW_ABI = [
    "function deposit(bytes32 _contractId) external payable",
    "function releaseMilestone(bytes32 _contractId, uint256 _milestoneId) external"
];

interface ContractDetailProps {
    contractId: string;
    userRole: "client" | "freelancer";
    userEmail?: string;
}

interface Milestone {
    _id?: string;
    description: string;
    amount: string;
    status: string;
}

interface Contract {
    _id: string;
    contractId: string;
    onchainId: string;
    status: string;
    freelancerAccepted: boolean;
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{ 
        milestones: Milestone[], 
        title: string, 
        description: string 
    }>({ 
        milestones: [], 
        title: "", 
        description: "" 
    });

    const router = useRouter();
    const { address: walletAddress, connectWallet } = useWalletConnection();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const fetchData = async () => {
        try {
            // setLoading(true); // Don't show full loader on re-fetch
            const res = await fetch(`${BACKEND_URL}/api/contracts/${contractId}`);
            if (!res.ok) throw new Error("Contract not found");
            const data = await res.json();
            setContract(data);
        } catch (err: any) {
            setError(err.message || "Failed to load contract");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [contractId, BACKEND_URL]);

    const handleSync = async () => {
        if (!contract) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/contracts/${contract._id}/sync`, { method: "POST" });
            if (res.ok) {
                toast({ title: "Synced", description: "Contract status updated from blockchain." });
                await fetchData();
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Sync Failed", description: "Could not sync with blockchain.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePublish = async () => {
        if (!walletAddress) {
            toast({ title: "Wallet Required", description: "Please connect your wallet first.", variant: "destructive" });
            connectWallet();
            return;
        }
        setIsProcessing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/contracts/${contractId}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientWallet: walletAddress })
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to publish contract");
            }

            toast({ title: "Success", description: "Contract published to blockchain! Waiting for confirmation..." });
            setTimeout(fetchData, 2000);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFund = async () => {
        if (!walletAddress || !contract) return;
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

            const amountWei = ethers.parseEther(contract.totalAmount.toString());
            
            const tx = await escrow.deposit(contract.onchainId, { value: amountWei });
            toast({ title: "Transaction Sent", description: "Funding escrow..." });
            await tx.wait();
            
            toast({ title: "Funded", description: "Escrow funded successfully!" });
            await handleSync();

        } catch (err: any) {
            console.error(err);
            toast({ title: "Funding Failed", description: err.message || "Transaction failed", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRelease = async (index: number) => {
        if (!walletAddress || !contract) return;
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

            const tx = await escrow.releaseMilestone(contract.onchainId, index);
            toast({ title: "Transaction Sent", description: "Releasing milestone..." });
            await tx.wait();
            
            toast({ title: "Released", description: "Funds released to freelancer!" });
            await handleSync();

        } catch (err: any) {
            console.error(err);
            toast({ title: "Release Failed", description: err.message || "Transaction failed", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAccept = async () => {
        if (!contract) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/contracts/${contractId}/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to accept terms");
            toast({ title: "Terms Accepted", description: "You have accepted the contract terms." });
            await fetchData();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Edit Handlers ---

    const handleEditToggle = () => {
        if (!contract) return;
        setEditForm({
            milestones: contract.milestones.map(m => ({ ...m })), // Deep copy
            title: contract.job?.title || "",
            description: contract.job?.description || ""
        });
        setIsEditing(true);
    };

    const handleMilestoneChange = (index: number, field: keyof Milestone, value: string) => {
        const newMilestones = [...editForm.milestones];
        newMilestones[index] = { ...newMilestones[index], [field]: value };
        setEditForm({ ...editForm, milestones: newMilestones });
    };

    const handleAddMilestone = () => {
        setEditForm({
            ...editForm,
            milestones: [
                ...editForm.milestones,
                { description: "", amount: "0", status: "pending" }
            ]
        });
    };

    const handleRemoveMilestone = (index: number) => {
        const newMilestones = editForm.milestones.filter((_, i) => i !== index);
        setEditForm({ ...editForm, milestones: newMilestones });
    };

    const handleSaveContract = async () => {
        if (!contract) return;
        
        // Validate
        if (editForm.milestones.length === 0) {
            toast({ title: "Error", description: "At least one milestone is required.", variant: "destructive" });
            return;
        }
        for (const m of editForm.milestones) {
            if (!m.description || !m.amount || parseFloat(m.amount) <= 0) {
                toast({ title: "Error", description: "All milestones must have a description and valid amount.", variant: "destructive" });
                return;
            }
        }

        setIsProcessing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/contracts/${contract._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    milestones: editForm.milestones,
                    title: editForm.title,
                    description: editForm.description
                })
            });

            if (!res.ok) throw new Error("Failed to update contract");

            const updatedContract = await res.json();
            // The backend returns { message, contract }
            setContract(updatedContract.contract);
            setIsEditing(false);
            toast({ title: "Updated", description: "Contract terms updated successfully." });

        } catch (err: any) {
            console.error(err);
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950">
                <AlertCircle className="w-16 h-16 text-red-500/50" />
                <h2 className="text-xl font-semibold text-zinc-100">{error || "Contract not found"}</h2>
                <Button onClick={() => router.back()} variant="outline" className="border-zinc-800 text-zinc-400">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "created": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "registered": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
            case "funded": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "completed": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "disputed": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
        }
    };

    const getMilestoneStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return "bg-zinc-800 text-zinc-500";
            case "in_progress": return "bg-blue-500/10 text-blue-400";
            case "completed": return "bg-emerald-500/10 text-emerald-400";
            case "approved": return "bg-purple-500/10 text-purple-400";
            default: return "bg-zinc-800 text-zinc-400";
        }
    };

    const completedMilestones = contract.milestones?.filter(m =>
        m.status === "completed" || m.status === "approved"
    ).length || 0;
    const totalMilestones = contract.milestones?.length || 1;
    const progress = (completedMilestones / totalMilestones) * 100;

    const otherParty = userRole === "client" ? contract.freelancer : contract.client;

    // Calculate total during edit
    const editTotal = editForm.milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto p-6 space-y-8 min-h-screen bg-zinc-950 text-zinc-100"
        >
            {/* Header / Nav */}
            <div className="flex justify-between items-center">
                <Button onClick={() => router.back()} variant="ghost" className="text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 px-0">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
                <div className="flex items-center gap-3">
                    {contract.status === "Created" && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${
                            contract.freelancerAccepted 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-zinc-900 text-zinc-500 border-zinc-800"
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${contract.freelancerAccepted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-700"}`} />
                            {contract.freelancerAccepted ? "Accepted by Freelancer" : "Awaiting Acceptance"}
                        </div>
                    )}
                    <Button onClick={handleSync} variant="outline" size="sm" disabled={isProcessing} className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100">
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
                        Sync status
                    </Button>
                </div>
            </div>

            {/* Main Contract Card */}
            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden relative">
                
                <CardHeader className="pb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-2 w-full">
                            <div className="flex items-center gap-3">
                                <Badge className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 ${getStatusColor(contract.status)}`}>
                                    {contract.status}
                                </Badge>
                                <span className="text-zinc-600 text-xs">/</span>
                                <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">#{contract.contractId.slice(0, 8)}</span>
                            </div>
                            
                            {isEditing ? (
                                <Input 
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    className="text-2xl font-bold bg-zinc-900 border-zinc-800 text-white w-full md:w-3/4"
                                    placeholder="Contract Title"
                                />
                            ) : (
                                <CardTitle className="text-3xl font-bold tracking-tight text-white leading-tight">
                                    {contract.job?.title || "Unknown Job"}
                                </CardTitle>
                            )}

                            {isEditing ? (
                                <Input 
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    className="text-sm bg-zinc-900 border-zinc-800 text-white w-full md:w-3/4 mt-2"
                                    placeholder="Brief Description"
                                />
                            ) : (
                                <div className="flex items-center gap-4 text-zinc-500 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(contract.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                    <div className="flex items-center gap-1.5 font-medium text-zinc-400">
                                        Escrow Protected
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-fit">
                            {/* Client Actions */}
                            {userRole === "client" && !isEditing && (
                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex gap-2.5">
                                        {contract.status === "Created" && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={handleEditToggle} 
                                                    className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl py-5"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Terms
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={handlePublish} 
                                                    disabled={isProcessing || !contract.freelancerAccepted}
                                                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-5 rounded-xl disabled:opacity-40 disabled:grayscale transition-all"
                                                >
                                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                                                    Publish & Sign
                                                </Button>
                                            </>
                                        )}
                                        {contract.status === "Registered" && (
                                            <Button 
                                                size="sm" 
                                                onClick={handleFund} 
                                                disabled={isProcessing}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-5 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                                            >
                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                                                Fund Escrow
                                            </Button>
                                        )}
                                    </div>
                                    {contract.status === "Created" && !contract.freelancerAccepted && (
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-right">
                                            Awaiting Freelancer Review
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Freelancer Actions */}
                            {userRole === "freelancer" && contract.status === "Created" && !contract.freelancerAccepted && (
                                <Button 
                                    size="sm" 
                                    onClick={handleAccept} 
                                    disabled={isProcessing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-5 rounded-xl transition-all shadow-lg shadow-blue-500/10"
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                                    Accept Contract Terms
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-10">
                    {/* Progress Bar Section */}
                    <div className="bg-zinc-950/30 rounded-2xl p-6 border border-zinc-800/50">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-1">Execution Progress</p>
                                <h4 className="text-sm font-semibold text-zinc-300">{completedMilestones} of {totalMilestones} Milestones Released</h4>
                            </div>
                            <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-zinc-800" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-950/20 rounded-2xl p-5 border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Contract Budget
                            </div>
                            <p className="text-white font-bold text-2xl">
                                {contract.paymentType === "crypto"
                                    ? `${isEditing ? editTotal.toFixed(4) : contract.totalAmount} ETH`
                                    : `₹${contract.totalAmount?.toLocaleString()}`}
                            </p>
                        </div>
                        <div className="bg-zinc-950/20 rounded-2xl p-5 border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                                <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Network
                            </div>
                            <p className="text-white font-bold text-2xl uppercase tracking-tight">Ethereum Sepolia</p>
                        </div>
                        <div className="bg-zinc-950/20 rounded-2xl p-5 border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                                <Calendar className="w-3.5 h-3.5 text-purple-500" /> Final Deadline
                            </div>
                            <p className="text-white font-bold text-2xl">
                                {contract.job?.deadline
                                    ? new Date(contract.job.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                    : "Rolling"}
                            </p>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client */}
                        <div className="bg-zinc-950/40 rounded-2xl p-6 border border-zinc-800/50 relative overflow-hidden group">
                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-600 mb-4">Originator (Client)</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white font-bold text-xl border border-zinc-700">
                                        {contract.client?.fullName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-base leading-none mb-1.5">{contract.client?.fullName}</h4>
                                        <p className="text-zinc-500 text-xs">{contract.client?.email}</p>
                                    </div>
                                </div>
                                {contract.client?.walletAddress && (
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer group/wallet">
                                        <Wallet className="w-3.5 h-3.5 text-zinc-500 group-hover/wallet:text-blue-400 transition-colors" />
                                        <span className="text-[10px] font-mono text-zinc-400">{contract.client.walletAddress.slice(0, 6)}...{contract.client.walletAddress.slice(-4)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Freelancer */}
                        <div className="bg-zinc-950/40 rounded-2xl p-6 border border-zinc-800/50 relative overflow-hidden group">
                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-600 mb-4">Contractor (Freelancer)</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white font-bold text-xl border border-zinc-700">
                                        {contract.freelancer?.fullName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-base leading-none mb-1.5">{contract.freelancer?.fullName}</h4>
                                        <p className="text-zinc-500 text-xs">{contract.freelancer?.email}</p>
                                    </div>
                                </div>
                                {contract.freelancer?.walletAddress && (
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer group/wallet">
                                        <Wallet className="w-3.5 h-3.5 text-zinc-500 group-hover/wallet:text-purple-400 transition-colors" />
                                        <span className="text-[10px] font-mono text-zinc-400">{contract.freelancer.walletAddress.slice(0, 6)}...{contract.freelancer.walletAddress.slice(-4)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Milestones Card */}
            <Card className="bg-zinc-900/40 border-zinc-800 shadow-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/50 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-blue-400" />
                        </div>
                        <CardTitle className="text-xl font-bold text-white">Execution Milestones</CardTitle>
                    </div>
                    {isEditing && (
                        <Button size="sm" onClick={handleAddMilestone} variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> Add Step
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-zinc-800/50">
                        {isEditing ? (
                            // --- EDIT MODE ---
                            <div className="p-6 space-y-4">
                                {editForm.milestones.map((milestone, idx) => (
                                    <div key={idx} className="bg-zinc-950/40 rounded-2xl p-5 border border-zinc-800 flex items-start gap-5 animate-in fade-in slide-in-from-top-2">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm font-bold mt-1 border border-zinc-800">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            <div className="lg:col-span-8">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 block">Deliverable</label>
                                                <Input 
                                                    value={milestone.description}
                                                    onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                                                    placeholder="Describe what will be delivered..."
                                                    className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-xl py-6 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div className="lg:col-span-4">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 block">Release Amount (ETH)</label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        type="number"
                                                        step="0.001"
                                                        value={milestone.amount}
                                                        onChange={(e) => handleMilestoneChange(idx, "amount", e.target.value)}
                                                        className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-xl py-6 focus:ring-blue-500/20"
                                                    />
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleRemoveMilestone(idx)}
                                                        className="h-12 w-12 text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-end gap-3 pt-6">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveContract} disabled={isProcessing} className="bg-white text-zinc-950 font-bold px-8 py-2.5 rounded-xl hover:bg-white/90">
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Update Proposal
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // --- VIEW MODE ---
                            contract.milestones?.map((milestone, idx) => (
                                <div
                                    key={milestone._id}
                                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-zinc-900/20 transition-colors"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${
                                            milestone.status === "completed" || milestone.status === "approved"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-zinc-900 text-zinc-600 border-zinc-800"
                                        }`}>
                                            {milestone.status === "completed" || milestone.status === "approved"
                                                ? <CheckCircle className="w-5 h-5" />
                                                : idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-zinc-100 font-semibold text-base mb-1">{milestone.description}</h4>
                                            <div className="flex items-center gap-3">
                                                <p className="text-zinc-400 font-bold text-sm">
                                                    {contract.paymentType === "crypto"
                                                        ? `${milestone.amount} ETH`
                                                        : `₹${parseFloat(milestone.amount).toLocaleString()}`}
                                                </p>
                                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${getMilestoneStatusColor(milestone.status).split(' ')[1]}`}>
                                                    {milestone.status.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {userRole === "client" && 
                                         (contract.status === "Funded" || contract.status === "Completed") && 
                                         milestone.status !== "completed" && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleRelease(idx)}
                                                disabled={isProcessing}
                                                className="w-full sm:w-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl py-5 font-bold uppercase text-[10px] tracking-widest px-6"
                                            >
                                                <Send className="w-3 h-3 mr-2" />
                                                Confirm Delivery
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/50 p-6 rounded-3xl border border-dashed border-zinc-800">
                <div className="flex flex-wrap gap-3">
                    <Link href={`/${userRole}/jobs/${contract.job?._id}`}>
                        <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl">
                            <Briefcase className="w-4 h-4 mr-2" /> Original job post
                        </Button>
                    </Link>
                    <Link href={`/${userRole}/disputes?contractId=${contract._id}`}>
                        <Button variant="ghost" className="text-zinc-600 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl">
                            <AlertTriangle className="w-4 h-4 mr-2" /> Protocol dispute
                        </Button>
                    </Link>
                </div>
                
                {/* <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                    SmartHire Escrow Protocol V2.0
                    <ExternalLink className="w-3 h-3" />
                </div> */}
            </div>
        </motion.div>
    );
}