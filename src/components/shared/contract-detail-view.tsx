"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MilestoneStepper } from "./milestone-stepper";
import { UserAvatar } from "./user-avatar";
import { ChevronLeft, FileText, Bot, AlertTriangle, ThumbsUp, Loader2, Wallet, Send, Star, XCircle, MessageSquare, CheckCircle, Download, Check, AlertCircle, Info, Plus, Trash2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const ESCROW_ADDRESS = "0x41fE53C6963a87006Fb59177CE1136b86a9B7297";
const ESCROW_ABI = [
    "function deposit(bytes32 _contractId) external payable",
    "function releaseMilestone(bytes32 _contractId, uint256 _milestoneId) external"
];

const InfoCard = ({ user, role }: { user: any, role: string }) => (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 group hover:bg-zinc-900/60 transition-all duration-300">
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-600 mb-4">{role}</p>
        <div className="flex items-center gap-4">
            <UserAvatar user={user} className="w-12 h-12 border border-zinc-800" />
            <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors truncate">{user?.fullName || 'N/A'}</h4 >
                <p className="text-[11px] text-zinc-500 font-medium truncate">{user?.email || 'N/A'}</p>
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
    const [isEditDialogOpen, setIsEditOpen] = useState(false);

    // Modal States for Confirmations
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: "accept" | "reject" | "revise" | null;
        title: string;
        description: string;
        confirmText: string;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        type: null,
        title: "",
        description: "",
        confirmText: "",
    });

    const [revisionInput, setRevisionInput] = useState("");

    // Edit State
    const [editData, setEditData] = useState({
        title: localContract.job?.title || "",
        description: localContract.description || "",
        deliverables: localContract.deliverables || [""],
        milestones: localContract.milestones?.map((m: any) => ({ description: m.description, amount: m.amount })) || [{ description: "", amount: "" }],
        revisionsAllowed: localContract.revisionsAllowed || 0,
        ownershipTransfer: localContract.ownershipTransfer || "after_full_payment",
        confidentialityRequired: localContract.confidentialityRequired || false,
        terminationPolicy: localContract.terminationPolicy || "",
    });

    const handleUpdateContract = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData)
            });

            if (!res.ok) throw new Error("Update failed");

            toast({ title: "Contract Updated", description: "Terms have been saved and revision feedback cleared." });
            
            // Refresh
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
            if (statusRes.ok) {
                const updated = await statusRes.json();
                setLocalContract(updated);
                setHasAccepted(updated.freelancerAccepted);
            }
            setIsEditOpen(false);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

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

    const handleConfirmAction = async () => {
        if (!confirmModal.type) return;
        
        setIsProcessing(true);
        try {
            let endpoint = "";
            let method = "POST";
            let body: any = null;

            switch (confirmModal.type) {
                case "accept":
                    endpoint = `/api/contracts/${localContract._id}/accept`;
                    break;
                case "reject":
                    endpoint = `/api/contracts/${localContract._id}/reject`;
                    break;
                case "revise":
                    endpoint = `/api/contracts/${localContract._id}/revise`;
                    body = { feedback: revisionInput };
                    break;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${endpoint}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined
            });

            if (!res.ok) throw new Error("Action failed");

            toast({ 
                title: "Success", 
                description: `Contract ${confirmModal.type}ed successfully.` 
            });

            if (confirmModal.type === "reject") {
                onBack();
            } else {
                // Refresh
                const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/${localContract._id}`);
                if (statusRes.ok) {
                    const updated = await statusRes.json();
                    setLocalContract(updated);
                    setHasAccepted(updated.freelancerAccepted);
                }
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            setRevisionInput("");
        }
    };

    const handleAccept = () => {
        setConfirmModal({
            isOpen: true,
            type: "accept",
            title: "Accept Contract Terms",
            description: "By accepting, you agree to the scope of work and milestones defined. You will be able to start work once the client funds the escrow.",
            confirmText: "Accept & Sign",
        });
    };

    const handleReject = () => {
        setConfirmModal({
            isOpen: true,
            type: "reject",
            title: "Reject Contract",
            description: "Are you sure you want to reject this contract? This action will cancel the proposal and cannot be undone.",
            confirmText: "Reject Contract",
            isDestructive: true,
        });
    };

    const handleRevise = () => {
        setConfirmModal({
            isOpen: true,
            type: "revise",
            title: "Request Revisions",
            description: "Please explain what changes you need the client to make to the contract terms or milestones.",
            confirmText: "Send Request",
        });
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

    const generateContractPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // --- Page Border ---
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // --- Header Section ---
        doc.setFillColor(20, 20, 25);
        doc.rect(10, 10, pageWidth - 20, 35, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("SERVICE AGREEMENT", 20, 30);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Contract ID: ${localContract.contractId}`, pageWidth - 90, 25);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 90, 30);

        // --- Section 1: Introduction ---
        let currentY = 60;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("1. PARTIES", 20, currentY);
        
        doc.setDrawColor(230, 230, 230);
        doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
        
        currentY += 10;
        doc.setFontSize(10);
        doc.text("The Client:", 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`${localContract.client.fullName}`, 50, currentY);
        doc.text(`Email: ${localContract.client.email}`, 50, currentY + 5);
        doc.text(`Wallet: ${localContract.client.walletAddress || "N/A"}`, 50, currentY + 10);

        currentY += 20;
        doc.setFont("helvetica", "bold");
        doc.text("The Freelancer:", 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`${localContract.freelancer.fullName}`, 50, currentY);
        doc.text(`Email: ${localContract.freelancer.email}`, 50, currentY + 5);
        doc.text(`Wallet: ${localContract.freelancer.walletAddress || "N/A"}`, 50, currentY + 10);

        // --- Section 2: Scope ---
        currentY += 25;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("2. SCOPE OF WORK", 20, currentY);
        doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
        
        currentY += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitDesc = doc.splitTextToSize(localContract.description || "The scope involves delivering professional services as defined in the job post and subsequent discussions.", 170);
        doc.text(splitDesc, 20, currentY);
        
        currentY += (splitDesc.length * 5) + 5;

        // --- Section 3: Deliverables ---
        if (localContract.deliverables?.length) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("3. DELIVERABLES", 20, currentY);
            doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
            
            currentY += 10;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            localContract.deliverables.forEach((item: string) => {
                doc.text(`• ${item}`, 25, currentY);
                currentY += 6;
            });
            currentY += 5;
        }

        // --- Section 4: Payment ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("4. PAYMENT TERMS", 20, currentY);
        doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
        
        currentY += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Contract Value: ${localContract.totalAmount} ETH`, 20, currentY);
        doc.text(`Currency: Ethereum (ETH) via Secure Escrow`, 20, currentY + 5);

        const milestoneData = localContract.milestones.map((m: any, i: number) => [
            `M${i + 1}`,
            m.description,
            `${m.amount} ETH`
        ]);

        autoTable(doc, {
            startY: currentY + 10,
            head: [['#', 'Description', 'Amount']],
            body: milestoneData,
            theme: 'grid',
            headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
            margin: { left: 20, right: 20 }
        });

        // --- Signatures ---
        const signatureY = pageHeight - 50;
        doc.setFont("helvetica", "bold");
        doc.text("SIGNATURES", 20, signatureY - 10);
        
        doc.setDrawColor(180);
        doc.line(20, signatureY + 15, 90, signatureY + 15);
        doc.line(120, signatureY + 15, 190, signatureY + 15);

        doc.setFontSize(8);
        doc.text("FOR THE CLIENT", 20, signatureY + 20);
        if (localContract.clientSigned || hasAccepted) {
             doc.setTextColor(0, 100, 0);
             doc.text(`Electronically Signed: ${new Date(localContract.createdAt).toLocaleDateString()}`, 20, signatureY + 25);
        }

        doc.setTextColor(0, 0, 0);
        doc.text("FOR THE FREELANCER", 120, signatureY + 20);
        if (localContract.freelancerAccepted) {
             doc.setTextColor(0, 100, 0);
             doc.text(`Electronically Signed: ${new Date(localContract.freelancerSignedAt || Date.now()).toLocaleDateString()}`, 120, signatureY + 25);
        }

        // --- Footer ---
        doc.setTextColor(150);
        doc.setFontSize(7);
        doc.text("This document is a legally binding electronic agreement secured by the SmartHire Blockchain Escrow system.", pageWidth / 2, pageHeight - 5, { align: "center" });

        doc.save(`Contract_${localContract.contractId.slice(0, 8)}.pdf`);
    };

    const generateInvoicePDF = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        // --- Header ---
        doc.setFillColor(16, 185, 129); // Emerald background for Invoice
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("FINAL INVOICE", 20, 25);
        doc.setFontSize(10);
        doc.text(`Invoice #: INV-${localContract.contractId.slice(0, 8).toUpperCase()}`, 150, 20);
        doc.text(`Date: ${date}`, 150, 25);

        // --- Parties ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Billed To (Client):", 20, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`${localContract.client.fullName}`, 20, 62);
        doc.text(`${localContract.client.email}`, 20, 67);
        doc.text(`Wallet: ${localContract.client.walletAddress || "N/A"}`, 20, 72);

        doc.setFont("helvetica", "bold");
        doc.text("From (Freelancer):", 120, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`${localContract.freelancer.fullName}`, 120, 62);
        doc.text(`${localContract.freelancer.email}`, 120, 67);
        doc.text(`Wallet: ${localContract.freelancer.walletAddress || "N/A"}`, 120, 72);

        // --- Summary ---
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Project Summary", 20, 95);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Project Title: ${localContract.job?.title || 'N/A'}`, 20, 102);
        doc.text(`Status: COMPLETED & RELEASED`, 20, 107);

        // --- Items Table ---
        const milestoneData = localContract.milestones.map((m: any, i: number) => [
            `M${i + 1}`,
            m.description,
            "100%",
            `${m.amount} ETH`
        ]);

        autoTable(doc, {
            startY: 115,
            head: [['Item', 'Description', 'Completion', 'Amount']],
            body: milestoneData,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
        });

        // --- Total ---
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Paid: ${localContract.totalAmount} ETH`, 190, finalY, { align: "right" });

        // --- Paid Stamp ---
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(1);
        doc.rect(140, finalY + 15, 50, 20);
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(18);
        doc.text("PAID", 153, finalY + 29);

        // --- Footer ---
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("This invoice was automatically generated upon successful completion of the blockchain-secured contract.", 105, 285, { align: "center" });

        doc.save(`Invoice_${localContract.contractId.slice(0, 8)}.pdf`);
        toast({ title: "Invoice Downloaded", description: "Your final invoice has been generated." });
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
                                        className="h-11 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-widest px-6 rounded-xl transition-all"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                        Request Revisions
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        disabled={isProcessing}
                                        variant="outline"
                                        className="h-11 border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-widest px-6 rounded-xl transition-all"
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={handleAccept}
                                        disabled={isAccepting}
                                        className="h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-[10px] uppercase tracking-widest px-8 rounded-xl transition-all shadow-xl shadow-white/5"
                                    >
                                        {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <ThumbsUp className="w-3.5 h-3.5 mr-2" />}
                                        Accept Terms
                                    </Button>
                                </div>
                            )}

                            {/* Client Actions */}
                            {userRole === 'client' && (
                                <div className="flex gap-2">
                                    {localContract.status === 'Created' && (
                                        <Button
                                            onClick={() => setIsEditOpen(true)}
                                            variant="outline"
                                            className="h-11 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-widest px-6 rounded-xl transition-all"
                                        >
                                            <FileText className="w-3.5 h-3.5 mr-2" />
                                            Edit Terms
                                        </Button>
                                    )}
                                    {localContract.status === 'Created' && hasAccepted && (
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isProcessing}
                                            className="h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-[10px] uppercase tracking-widest px-8 rounded-xl transition-all shadow-xl shadow-white/5"
                                        >
                                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <FileText className="w-3.5 h-3.5 mr-2" />}
                                            Publish & Sign
                                        </Button>
                                    )}
                                    {localContract.status === 'Registered' && (
                                        <Button
                                            onClick={handleFund}
                                            disabled={isProcessing}
                                            className="h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Wallet className="w-3.5 h-3.5 mr-2" />}
                                            Fund Escrow
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 mb-1">Total Contract Value</p>
                                <p className="text-4xl font-black text-white">{formatCurrency(parseFloat(localContract.totalAmount), currency)}</p>
                            </div>
                            <Button 
                                onClick={generateContractPDF}
                                variant="outline" 
                                className="bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-[0.2em] h-10 px-6 rounded-xl transition-all"
                            >
                                <Download className="w-3.5 h-3.5 mr-2" /> Download Contract PDF
                            </Button>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                        {localContract.job?.title || 'Contract'}
                    </h1>
                    
                    {/* Contract Overview Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: "Start Date", value: localContract.startDate ? new Date(localContract.startDate).toLocaleDateString() : "Not specified" },
                            { label: "End Date", value: localContract.endDate ? new Date(localContract.endDate).toLocaleDateString() : "Open-ended" },
                            { label: "Revisions", value: `${localContract.revisionsAllowed} Allowed` },
                            { 
                                label: "IP Ownership", 
                                value: localContract.ownershipTransfer ? localContract.ownershipTransfer.replace(/_/g, ' ') : 'Standard',
                                isBadge: true 
                            },
                        ].map((stat, i) => (
                            <div key={i} className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2">{stat.label}</p>
                                {stat.isBadge ? (
                                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700 capitalize text-[10px] font-bold tracking-wider">
                                        {stat.value}
                                    </Badge>
                                ) : (
                                    <p className="text-zinc-200 font-bold text-sm tracking-tight">{stat.value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Scope & Deliverables */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="md:col-span-2 space-y-8">
                            {/* Revision Feedback Notice (Client Only) */}
                            {userRole === 'client' && localContract.revisionFeedback && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4 items-start"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-1">Revision Requested</h4>
                                        <p className="text-zinc-300 text-sm leading-relaxed">&quot;{localContract.revisionFeedback}&quot;</p>
                                        <p className="text-[10px] text-zinc-500 mt-3 font-bold uppercase">Action Required: Update the contract draft to address these points.</p>
                                    </div>
                                </motion.div>
                            )}

                            <section>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Scope of Work
                                </h3>
                                <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap">
                                    {localContract.description || "No specific scope defined."}
                                </div>
                            </section>
                            
                            {localContract.deliverables && localContract.deliverables.length > 0 && (
                                <section>
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-3 h-3" /> Key Deliverables
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {localContract.deliverables.map((item: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-xl group hover:border-zinc-700 transition-colors">
                                                <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                                                <p className="text-xs font-medium text-zinc-300">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <aside className="space-y-8">
                            <section>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Terms & Conditions</h3>
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 space-y-6">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Termination Policy</p>
                                        <p className="text-xs text-zinc-400 leading-snug">{localContract.terminationPolicy || "Standard Platform Policy"}</p>
                                    </div>
                                    <div className="pt-4 border-t border-zinc-800/50">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Confidentiality</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${localContract.confidentialityRequired ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-700"}`} />
                                            <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{localContract.confidentialityRequired ? "NDA Required" : "Standard"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </header>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        
                        {/* Execution Progress Bar */}
                        <div className="mb-10 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-1">Execution Progress</p>
                                    <h2 className="text-3xl font-bold text-white">Milestone Progress</h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-400">
                                        {Math.round(((localContract.milestones?.filter((m: any) => m.status === 'completed' || m.status === 'paid' || m.status === 'released').length || 0) / (localContract.milestones?.length || 1)) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <Progress 
                                value={((localContract.milestones?.filter((m: any) => m.status === 'completed' || m.status === 'paid' || m.status === 'released').length || 0) / (localContract.milestones?.length || 1)) * 100} 
                                className="h-2 bg-zinc-800"
                            />
                        </div>

                        <MilestoneStepper
                            milestones={localContract.milestones || []}
                            currency={currency}
                            userRole={userRole}
                            contractStatus={localContract.status}
                            onRelease={handleRelease}
                        />
                    </motion.div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Contract Parties</h3>
                        <div className="space-y-3">
                            <InfoCard user={localContract.client} role="Client" />
                            <InfoCard user={localContract.freelancer} role="Freelancer" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">SmartHire Intelligence</h3>
                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 text-center relative overflow-hidden group">
                            {/* Subtle background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
                            
                            <div className="relative z-10">
                                <Bot className="mx-auto w-10 h-10 text-blue-400 mb-4 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]" />
                                <p className="text-zinc-400 text-xs leading-relaxed mb-6 italic">&quot;Our AI is monitoring this contract to ensure fairness and clarity for both parties.&quot;</p>
                                
                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => setIsAssistantOpen(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-blue-900/20 transition-all"
                                    >
                                        Ask AI Assistant
                                    </Button>
                                    {localContract.status === 'Completed' && (
                                        <Button 
                                            onClick={generateInvoicePDF}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-emerald-900/20 transition-all mt-4"
                                        >
                                            <FileText className="w-3 h-3 mr-2" /> Final Invoice
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dispute Warning */}
                    {canRaiseDispute && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                            <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Arbitration</h3>
                                </div>
                                <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                                    Experiencing problems? You can raise a formal dispute for admin review.
                                </p>
                                <Button
                                    onClick={() => !isDisputed && setShowDisputeModal(true)}
                                    disabled={isDisputed}
                                    variant="outline"
                                    className={`w-full h-10 border-red-500/20 text-red-400 text-[10px] uppercase font-bold tracking-widest ${!isDisputed ? 'hover:bg-red-500/10 hover:border-red-500/40' : 'opacity-50'}`}
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

            {/* Action Confirmation Modal */}
            <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md rounded-3xl shadow-2xl">
                    <DialogHeader>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${confirmModal.isDestructive ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {confirmModal.type === 'accept' ? <ThumbsUp className="w-6 h-6" /> : 
                             confirmModal.type === 'reject' ? <XCircle className="w-6 h-6" /> : 
                             <MessageSquare className="w-6 h-6" />}
                        </div>
                        <DialogTitle className="text-xl font-bold">{confirmModal.title}</DialogTitle>
                        <DialogDescription className="text-zinc-400 pt-2">
                            {confirmModal.description}
                        </DialogDescription>
                    </DialogHeader>

                    {confirmModal.type === 'revise' && (
                        <div className="py-4">
                            <Textarea 
                                placeholder="Explain what changes are needed..."
                                value={revisionInput}
                                onChange={(e) => setRevisionInput(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 min-h-[100px] text-sm"
                            />
                        </div>
                    )}

                    <DialogFooter className="gap-2 mt-6">
                        <Button variant="ghost" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="text-zinc-500">Cancel</Button>
                        <Button 
                            onClick={handleConfirmAction}
                            disabled={isProcessing || (confirmModal.type === 'revise' && !revisionInput.trim())}
                            className={`px-6 font-bold ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-zinc-950 hover:bg-zinc-200'}`}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : confirmModal.confirmText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Contract Modal (Client Only) */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader className="px-8 pt-8">
                        <DialogTitle className="text-2xl font-black">Edit Contract Terms</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Update the scope, deliverables, and milestones to address the freelancer&apos;s feedback.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
                        {/* Scope */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Scope</Label>
                            <Textarea 
                                value={editData.description}
                                onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-zinc-900 border-zinc-800 min-h-[120px] rounded-2xl focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Deliverables */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Deliverables</Label>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setEditData(prev => ({ ...prev, deliverables: [...prev.deliverables, ""] }))}
                                    className="text-blue-400 hover:bg-blue-500/10 text-[10px] font-bold"
                                >
                                    + Add Item
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {editData.deliverables.map((d: string, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <Input 
                                            value={d} 
                                            onChange={e => {
                                                const next = [...editData.deliverables];
                                                next[i] = e.target.value;
                                                setEditData(p => ({ ...p, deliverables: next }));
                                            }}
                                            className="bg-zinc-900 border-zinc-800 rounded-xl h-11"
                                        />
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => setEditData(p => ({ ...p, deliverables: p.deliverables.filter((_: string, idx: number) => idx !== i) }))}
                                            className="text-zinc-600 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Milestones */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Milestones</Label>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setEditData(prev => ({ ...prev, milestones: [...prev.milestones, { description: "", amount: "" }] }))}
                                    className="text-blue-400 hover:bg-blue-500/10 text-[10px] font-bold"
                                >
                                    + Add Milestone
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {editData.milestones.map((m: any, i: number) => (
                                    <div key={i} className="flex gap-3 items-start bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                                        <div className="flex-1 space-y-2">
                                            <Input 
                                                placeholder="Description" 
                                                value={m.description}
                                                onChange={e => {
                                                    const next = [...editData.milestones];
                                                    next[i].description = e.target.value;
                                                    setEditData(p => ({ ...p, milestones: next }));
                                                }}
                                                className="bg-zinc-950 border-zinc-800 h-10"
                                            />
                                            <Input 
                                                type="number" 
                                                placeholder="ETH" 
                                                value={m.amount}
                                                onChange={e => {
                                                    const next = [...editData.milestones];
                                                    next[i].amount = e.target.value;
                                                    setEditData(p => ({ ...p, milestones: next }));
                                                }}
                                                className="bg-zinc-950 border-zinc-800 h-10"
                                            />
                                        </div>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => setEditData(p => ({ ...p, milestones: p.milestones.filter((_: any, idx: number) => idx !== i) }))}
                                            className="text-zinc-600 hover:text-red-400 mt-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-8 py-6 bg-zinc-900/50 border-t border-zinc-800 gap-3">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="text-zinc-400">Cancel</Button>
                        <Button 
                            onClick={handleUpdateContract}
                            disabled={isProcessing}
                            className="bg-white text-zinc-950 font-black px-10 h-12 rounded-xl hover:bg-zinc-200"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
