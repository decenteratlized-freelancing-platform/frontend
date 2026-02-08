"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MilestoneStepper } from "./milestone-stepper";
import { UserAvatar } from "./user-avatar";
import { ChevronLeft, FileText, Bot, AlertTriangle, ThumbsUp, Loader2, Wallet, Send, Star, XCircle, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStatusStyles } from "@/lib/contract-utils";
import RaiseDisputeModal from "./raise-dispute-modal";
import { toast } from "@/hooks/use-toast";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ethers } from "ethers";
import { GeminiAssistant } from "./gemini-assistant";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Textarea } from "@/components/ui/textarea";

const ESCROW_ADDRESS = "0x41fE53C6963a87006Fb59177CE1136b86a9B7297";
const ESCROW_ABI = [
    "function deposit(bytes32 _contractId) external payable",
    "function releaseMilestone(bytes32 _contractId, uint256 _milestoneId) external"
];

const InfoCard = ({ user, role }: { user: any, role: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-sm text-neutral-400 mb-4">{role}</p>
        <div className="flex items-center gap-4">
            <UserAvatar user={user} className="w-12 h-12" />
            <div>
                <h4 className="text-lg font-bold text-white">{user?.fullName || 'N/A'}</h4 >
                <p className="text-sm text-neutral-300">{user?.email || 'N/A'}</p>
            </div>
        </div>
    </div>
);

interface ContractDetailViewProps {
    contract: any;
    userRole: string;
    userId: string;
    onBack: () => void;
    onDisputeCreated?: () => void;
}

export function ContractDetailView({ contract: initialContract, userRole, userId, onBack, onDisputeCreated }: ContractDetailViewProps) {
    const [localContract, setLocalContract] = useState(initialContract);
    const currency = 'ETH';
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAccepted, setHasAccepted] = useState(localContract.freelancerAccepted);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const { address: walletAddress, connectWallet } = useWalletConnection();

    // Review State
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchLatestContract = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${initialContract._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setLocalContract(data);
                    setHasAccepted(data.freelancerAccepted);
                }
            } catch (error) {
                console.error("Failed to refresh contract data:", error);
            }
        };
        fetchLatestContract();
    }, [initialContract._id]);

    // Determine the other party for the dispute
    const againstUserId = userRole === 'client'
        ? localContract.freelancer?._id
        : localContract.client?._id;

    // Can raise dispute on any contract that is not completed, cancelled, or refunded
    const excludedStatuses = ['completed', 'cancelled', 'refunded'];
    const canRaiseDispute = !excludedStatuses.includes(localContract.status?.toLowerCase());
    const isDisputed = localContract.status?.toLowerCase() === 'disputed';

    const handleDisputeSuccess = () => {
        setShowDisputeModal(false);
        onDisputeCreated?.();
        // Refresh contract to show disputed status
        const fetchLatestContract = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setLocalContract(data);
                }
            } catch (error) {
                console.error("Failed to refresh contract data after dispute:", error);
            }
        };
        fetchLatestContract();
    };

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.error || "Failed to accept terms");
                } catch {
                    throw new Error(`Server error: ${res.status} ${res.statusText}`);
                }
            }

            const data = await res.json();

            toast({ title: "Terms Accepted", description: "You have accepted the contract terms." });
            setHasAccepted(true);

            if (data && data.freelancerAccepted) setHasAccepted(true);
        } catch (err: any) {
            console.error("Accept error:", err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject this contract? This will cancel the proposal and return the job to 'open' status.")) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to reject contract");
            toast({ title: "Contract Rejected", description: "The contract has been cancelled." });
            onBack(); // Go back to list since contract is cancelled
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRevise = async () => {
        const feedback = window.prompt("What changes do you need? (This will notify the client)");
        if (feedback === null) return;

        setIsProcessing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/revise`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback })
            });
            if (!res.ok) throw new Error("Failed to request revisions");
            toast({ title: "Revision Requested", description: "The client has been notified of your feedback." });
            
            // Refresh
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
            if (statusRes.ok) {
                setLocalContract(await statusRes.json());
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientWallet: walletAddress })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to publish contract");
            }

            toast({ title: "Success", description: "Contract published to blockchain! Waiting for confirmation..." });
            // Refresh local state to show 'Registered' status and Fund button
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
            if (statusRes.ok) {
                setLocalContract(await statusRes.json());
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFund = async () => {
        if (!walletAddress) return;

        // Check if the current wallet matches the client authority address registered on-chain
        if (localContract.client?.walletAddress && walletAddress.toLowerCase() !== localContract.client.walletAddress.toLowerCase()) {
            toast({ 
                title: "Incorrect Wallet", 
                description: `Please switch to your registered wallet: ${localContract.client.walletAddress.slice(0, 6)}...${localContract.client.walletAddress.slice(-4)}`, 
                variant: "destructive" 
            });
            return;
        }

        setIsProcessing(true);
        try {
            if (!(window as any).ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider((window as any).ethereum);

            // Check Network (Sepolia)
            const network = await provider.getNetwork();
            if (network.chainId !== BigInt(11155111)) {
                toast({
                    title: "Wrong Network",
                    description: "Please switch your wallet to Sepolia Testnet.",
                    variant: "destructive"
                });
                try {
                    await (window as any).ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
                    });
                } catch (switchError) {
                    // User rejected switch
                    setIsProcessing(false);
                    return;
                }
                // Update provider after switch might be needed, but usually Metamask handles reload or state change. 
                // Ideally we return and let user click again or continue if provider updates automatically.
                // For safety, let's stop and ask user to click again.
                setIsProcessing(false);
                return;
            }

            const signer = await provider.getSigner();
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

            const amountWei = ethers.parseEther(localContract.totalAmount.toString());

            // Optional: Check balance proactively
            const balance = await provider.getBalance(walletAddress);
            if (balance < amountWei) {
                const balanceEth = ethers.formatEther(balance);
                const requiredEth = ethers.formatEther(amountWei);
                throw new Error(`INSUFFICIENT_FUNDS_DETAILED: Has ${balanceEth} ETH, Needs ${requiredEth} ETH`);
            }

            const tx = await escrow.deposit(localContract.onchainId, { value: amountWei });
            toast({ title: "Transaction Sent", description: "Funding escrow..." });
            await tx.wait();

            toast({ title: "Funded", description: "Escrow funded successfully!" });

            // Sync status
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/sync`, { method: 'POST' });
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
            if (statusRes.ok) {
                setLocalContract(await statusRes.json());
            }

        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message || "Transaction failed";
            let errorTitle = "Funding Failed";

            if (err.message.includes("INSUFFICIENT_FUNDS_DETAILED")) {
                errorTitle = "Insufficient Funds";
                errorMessage = err.message.replace("INSUFFICIENT_FUNDS_DETAILED: ", "");
            } else if (err.code === "INSUFFICIENT_FUNDS" || errorMessage.includes("insufficient funds") || errorMessage.includes("INSUFFICIENT_FUNDS")) {
                errorTitle = "Insufficient Sepolia ETH";
                errorMessage = "You don't have enough testnet ETH. Please use a Sepolia Faucet to get free funds.";
            } else if (err.code === "ACTION_REJECTED") {
                errorMessage = "Transaction rejected by user.";
            }

            toast({ title: errorTitle, description: errorMessage, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRelease = async (index: number) => {
        if (!walletAddress) return;

        // Check if the current wallet matches the client authority address registered on-chain
        if (localContract.client?.walletAddress && walletAddress.toLowerCase() !== localContract.client.walletAddress.toLowerCase()) {
            toast({ 
                title: "Incorrect Wallet", 
                description: `Please switch to your registered wallet: ${localContract.client.walletAddress.slice(0, 6)}...${localContract.client.walletAddress.slice(-4)}`, 
                variant: "destructive" 
            });
            return;
        }

        setIsProcessing(true);
        try {
            if (!(window as any).ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

            const tx = await escrow.releaseMilestone(localContract.onchainId, index);
            toast({ title: "Transaction Sent", description: "Releasing milestone..." });
            await tx.wait();

            toast({ title: "Released", description: "Funds released to freelancer!" });

            // Sync status
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/sync`, { method: 'POST' });
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
            if (statusRes.ok) {
                setLocalContract(await statusRes.json());
            }

        } catch (err: any) {
            console.error(err);
            toast({ title: "Release Failed", description: err.message || "Transaction failed", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!localContract) return;
        if (reviewRating === 0) {
            toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
            return;
        }

        setIsSubmittingReview(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    role: userRole,
                    rating: reviewRating,
                    comment: reviewComment
                })
            });

            if (!res.ok) throw new Error("Failed to submit review");
            
            toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
            
            // Refresh contract data
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
            if (statusRes.ok) {
                setLocalContract(await statusRes.json());
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const generateInvoice = (milestone: any, index: number) => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        // Header
        doc.setFontSize(20);
        doc.text("SmartHire Invoice", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Invoice Date: ${date}`, 105, 30, { align: "center" });
        doc.text(`Contract ID: ${localContract.contractId}`, 105, 35, { align: "center" });

        // Line
        doc.setDrawColor(200);
        doc.line(20, 45, 190, 45);

        // Parties
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("From (Client):", 20, 55);
        doc.setFontSize(10);
        doc.text(`${localContract.client.fullName}`, 20, 62);
        doc.text(`${localContract.client.email}`, 20, 67);

        doc.setFontSize(12);
        doc.text("To (Freelancer):", 120, 55);
        doc.setFontSize(10);
        doc.text(`${localContract.freelancer.fullName}`, 120, 62);
        doc.text(`${localContract.freelancer.email}`, 120, 67);

        // Milestone Details
        doc.setFontSize(12);
        doc.text("Project / Milestone Details:", 20, 85);
        
        autoTable(doc, {
            startY: 90,
            head: [['Milestone #', 'Description', 'Amount']],
            body: [
                [index + 1, milestone.description, `${milestone.amount} ETH`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Total
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text(`Total Amount: ${milestone.amount} ETH`, 190, finalY, { align: "right" });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("This is a blockchain-verified invoice generated by SmartHire.", 105, 280, { align: "center" });

        doc.save(`Invoice_${localContract.contractId.slice(0, 8)}_M${index + 1}.pdf`);
        toast({ title: "Invoice Generated", description: "Your PDF invoice has been downloaded." });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Button onClick={onBack} variant="ghost" className="mb-8 flex items-center gap-2 text-neutral-300 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                    Back to All Contracts
                </Button>

                <header className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <Badge className={`${getStatusStyles(localContract.status)} text-base px-4 py-2 rounded-lg`}>
                                {localContract.status}
                            </Badge>
                            {canRaiseDispute && (
                                <Button
                                    onClick={() => !isDisputed && setShowDisputeModal(true)}
                                    disabled={isDisputed}
                                    variant="outline"
                                    className={`border-red-500/50 text-red-400 ${!isDisputed ? 'hover:bg-red-500/10 hover:text-red-300' : 'opacity-70'}`}
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    {isDisputed ? "Dispute Raised" : "Raise Dispute"}
                                </Button>
                            )}

                            {/* Freelancer Actions */}
                            {userRole === 'freelancer' && localContract.status === 'Created' && !hasAccepted && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleRevise}
                                        disabled={isProcessing}
                                        variant="outline"
                                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-bold px-6"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Request Revisions
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        disabled={isProcessing}
                                        variant="outline"
                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold px-6"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={handleAccept}
                                        disabled={isAccepting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                                    >
                                        {isAccepting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                                        Accept Contract
                                    </Button>
                                </div>
                            )}

                            {/* Client Actions */}
                            {userRole === 'client' && (
                                <>
                                    {localContract.status === 'Created' && hasAccepted && (
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isProcessing}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                            Publish & Sign
                                        </Button>
                                    )}
                                    {localContract.status === 'Registered' && (
                                        <Button
                                            onClick={handleFund}
                                            disabled={isProcessing}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                                            Fund Escrow
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-neutral-400">Total Contract Value</p>
                            <p className="text-4xl font-bold text-white">{formatCurrency(parseFloat(localContract.totalAmount), currency)}</p>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white leading-tight">
                        {localContract.job?.title || 'Contract'}
                    </h1>
                </header>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <h2 className="text-3xl font-bold text-white mb-6">Milestone Progress</h2>
                        <MilestoneStepper
                            milestones={localContract.milestones || []}
                            currency={currency}
                            userRole={userRole}
                            contractStatus={localContract.status}
                            onRelease={handleRelease}
                            onDownloadInvoice={generateInvoice}
                        />
                    </motion.div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-2xl font-bold text-white mb-4">Parties</h3>
                        <div className="space-y-4">
                            <InfoCard user={localContract.client} role="Client" />
                            <InfoCard user={localContract.freelancer} role="Freelancer" />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <h3 className="text-2xl font-bold text-white mb-4">Contract AI Assistant</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <Bot className="mx-auto w-12 h-12 text-blue-400 mb-4" />
                            <p className="text-neutral-300">Our AI is monitoring this contract to ensure fairness and clarity. Have a question about a term? Ask our assistant.</p>
                            <Button 
                                onClick={() => setIsAssistantOpen(true)}
                                variant="outline" 
                                className="mt-6 bg-transparent border-white/20 text-white hover:bg-white/10"
                            >
                                Ask Assistant
                            </Button>
                        </div>
                    </motion.div>

                    {/* Dispute Warning */}
                    {canRaiseDispute && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                    <h3 className="text-lg font-bold text-yellow-400">Having Issues?</h3>
                                </div>
                                <p className="text-sm text-neutral-300 mb-4">
                                    If you&apos;re experiencing problems with this contract, you can raise a dispute for admin review.
                                </p>
                                <Button
                                    onClick={() => !isDisputed && setShowDisputeModal(true)}
                                    disabled={isDisputed}
                                    variant="outline"
                                    className={`w-full border-yellow-500/50 text-yellow-400 ${!isDisputed ? 'hover:bg-yellow-500/10' : 'opacity-70'}`}
                                >
                                    {isDisputed ? "Dispute Raised" : "Raise a Dispute"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            {localContract.status.toLowerCase() === "completed" && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.6 }}
                    className="mt-12 bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <Star className="text-yellow-500 fill-yellow-500" /> Contract Reviews
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Review from Client (about Freelancer) */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 relative">
                            <Badge className="absolute -top-3 left-6 bg-blue-600 text-white border-none">Client Feedback</Badge>
                            {localContract.freelancerReview ? (
                                <div>
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < localContract.freelancerReview.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} />
                                        ))}
                                    </div>
                                    <p className="text-zinc-200 leading-relaxed italic text-lg">&quot;{localContract.freelancerReview.comment}&quot;</p>
                                    <p className="text-zinc-500 text-xs mt-4 font-medium uppercase tracking-widest">{new Date(localContract.freelancerReview.createdAt).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Star className="w-8 h-8 text-zinc-800 mb-2" />
                                    <p className="text-zinc-500 text-sm font-medium">Waiting for client review...</p>
                                </div>
                            )}
                        </div>

                        {/* Review from Freelancer (about Client) */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 relative">
                            <Badge className="absolute -top-3 left-6 bg-purple-600 text-white border-none">Freelancer Feedback</Badge>
                            {localContract.clientReview ? (
                                <div>
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < localContract.clientReview.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} />
                                        ))}
                                    </div>
                                    <p className="text-zinc-200 leading-relaxed italic text-lg">&quot;{localContract.clientReview.comment}&quot;</p>
                                    <p className="text-zinc-500 text-xs mt-4 font-medium uppercase tracking-widest">{new Date(localContract.clientReview.createdAt).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Star className="w-8 h-8 text-zinc-800 mb-2" />
                                    <p className="text-zinc-500 text-sm font-medium">Waiting for freelancer review...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review Submission Form */}
                    {((userRole === "client" && !localContract.freelancerReview) || (userRole === "freelancer" && !localContract.clientReview)) && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-12 pt-12 border-t border-white/10"
                        >
                            <div className="max-w-2xl">
                                <h4 className="text-xl font-bold text-white mb-2">How was your experience?</h4>
                                <p className="text-zinc-400 mb-8">Your feedback helps maintain trust in the SmartHire community.</p>
                                
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 block">Star Rating</label>
                                        <div className="flex items-center gap-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-all hover:scale-125 group"
                                                >
                                                    <Star 
                                                        className={`w-10 h-10 transition-colors ${
                                                            star <= reviewRating 
                                                                ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" 
                                                                : "text-zinc-800 group-hover:text-zinc-600"
                                                        }`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 block">Your Comments</label>
                                        <Textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Write a brief summary of the collaboration..."
                                            className="bg-black/40 border-white/10 text-white min-h-[120px] rounded-2xl focus:ring-blue-500/20 text-lg p-6"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button 
                                            onClick={handleSubmitReview} 
                                            disabled={isSubmittingReview || reviewRating === 0}
                                            className="bg-white hover:bg-zinc-200 text-black font-black px-10 py-6 rounded-2xl transition-all shadow-xl shadow-white/5 text-base"
                                        >
                                            {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Submit Feedback"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Dispute Modal */}
            <RaiseDisputeModal
                isOpen={showDisputeModal}
                onClose={() => setShowDisputeModal(false)}
                contractId={localContract._id}
                userId={userId}
                userRole={userRole as "client" | "freelancer"}
                againstUserId={againstUserId}
                onSuccess={handleDisputeSuccess}
            />

            {/* Gemini Assistant */}
            <AnimatePresence>
                {isAssistantOpen && (
                    <GeminiAssistant 
                        isOpen={isAssistantOpen} 
                        onClose={() => setIsAssistantOpen(false)} 
                        context={{
                            contractId: localContract.contractId,
                            jobTitle: localContract.job?.title,
                            totalAmount: localContract.totalAmount,
                            status: localContract.status,
                            milestones: localContract.milestones
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
