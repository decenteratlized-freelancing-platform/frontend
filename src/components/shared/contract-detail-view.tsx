"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MilestoneStepper } from "./milestone-stepper";
import { UserAvatar } from "./user-avatar";
import { ChevronLeft, FileText, Bot, AlertTriangle, ThumbsUp, Loader2, Wallet, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStatusStyles } from "@/lib/contract-utils";
import RaiseDisputeModal from "./raise-dispute-modal";
import { toast } from "@/hooks/use-toast";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ethers } from "ethers";
import { GeminiAssistant } from "./gemini-assistant";

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

    useEffect(() => {
        const fetchLatestContract = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/contracts/${initialContract._id}`);
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

    const handleDisputeSuccess = () => {
        setShowDisputeModal(false);
        onDisputeCreated?.();
    };

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/contracts/${localContract._id}/accept`, {
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

    const handlePublish = async () => {
        if (!walletAddress) {
            toast({ title: "Wallet Required", description: "Please connect your wallet first.", variant: "destructive" });
            connectWallet();
            return;
        }
        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:5000/api/contracts/${localContract._id}/publish`, {
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
            const statusRes = await fetch(`http://localhost:5000/api/contracts/${localContract._id}`);
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
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Check Network (Sepolia)
            const network = await provider.getNetwork();
            if (network.chainId !== 11155111n) {
                toast({
                    title: "Wrong Network",
                    description: "Please switch your wallet to Sepolia Testnet.",
                    variant: "destructive"
                });
                try {
                    await window.ethereum.request({
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
            await fetch(`http://localhost:5000/api/contracts/${localContract._id}/sync`, { method: 'POST' });
            const statusRes = await fetch(`http://localhost:5000/api/contracts/${localContract._id}`);
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
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

            const tx = await escrow.releaseMilestone(localContract.onchainId, index);
            toast({ title: "Transaction Sent", description: "Releasing milestone..." });
            await tx.wait();

            toast({ title: "Released", description: "Funds released to freelancer!" });

            // Sync status
            await fetch(`http://localhost:5000/api/contracts/${localContract._id}/sync`, { method: 'POST' });
            const statusRes = await fetch(`http://localhost:5000/api/contracts/${localContract._id}`);
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
                                    onClick={() => setShowDisputeModal(true)}
                                    variant="outline"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Raise Dispute
                                </Button>
                            )}

                            {/* Freelancer Actions */}
                            {userRole === 'freelancer' && localContract.status === 'Created' && !hasAccepted && (
                                <Button
                                    onClick={handleAccept}
                                    disabled={isAccepting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                                >
                                    {isAccepting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                                    Accept Contract
                                </Button>
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
                                    If you're experiencing problems with this contract, you can raise a dispute for admin review.
                                </p>
                                <Button
                                    onClick={() => setShowDisputeModal(true)}
                                    variant="outline"
                                    className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                                >
                                    Raise a Dispute
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

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
