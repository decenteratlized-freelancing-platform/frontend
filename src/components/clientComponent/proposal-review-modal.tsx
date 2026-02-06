"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/shared/user-avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCurrency } from "@/context/CurrencyContext";
import { CheckCircle, XCircle, Clock, Mail, Briefcase, Loader2, Target } from "lucide-react"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useSocket } from "@/context/SocketContext"

interface Proposal {
    _id: string
    freelancer: {
        _id: string
        fullName: string
        email: string
        image?: string
        skills: string[]
    }
    coverLetter: string
    proposedRate: number
    deliveryTime: string
    status: "pending" | "accepted" | "rejected" | "contract_pending"
    createdAt: string
}

interface ProposalReviewModalProps {
    jobId: string | null
    isOpen: boolean
    onClose: () => void
    onMessage?: (freelancerId: string, freelancerName: string, freelancerImage?: string) => void
}

export function ProposalReviewModal({ jobId, isOpen, onClose, onMessage }: ProposalReviewModalProps) {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(false)
    const [jobCurrency, setJobCurrency] = useState<'INR' | 'ETH'>('INR');
    const currentUser = useCurrentUser();
    const { socket } = useSocket();

    useEffect(() => {
        if (isOpen && jobId) {
            fetchProposals()
            fetchJobDetails()
        }
    }, [isOpen, jobId])

    useEffect(() => {
        if (socket) {
            socket.on("proposal_accepted", (data: any) => {
                toast.info("A proposal has been accepted.");
                setProposals(prevProposals =>
                    prevProposals.map(p =>
                        p._id === data.proposal._id ? { ...p, status: data.proposal.status } : p
                    )
                );
            });

            return () => {
                socket.off("proposal_accepted");
            };
        }
    }, [socket]);

    const fetchJobDetails = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs/${jobId}`);
            if (res.ok) {
                const job = await res.json();
                setJobCurrency(job.paymentCurrency);
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
        }
    };

    const fetchProposals = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/proposals/job/${jobId}`)
            if (res.ok) {
                const data = await res.json()
                setProposals(data)
            } else {
                toast.error("Failed to fetch proposals")
            }
        } catch (error) {
            console.error("Error fetching proposals:", error)
            toast.error("Error fetching proposals")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (proposalId: string, status: "accepted" | "rejected") => {
        try {
            if (!currentUser?.email) {
                toast.error("You must be logged in to perform this action.");
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/proposals/${proposalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    clientEmail: currentUser.email
                }),
            })

            if (res.ok) {
                toast.success(`Proposal ${status} successfully`)
                setProposals(proposals.map(p =>
                    p._id === proposalId ? { ...p, status } : p
                ))
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Error updating status")
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'contract_pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-white/10 text-gray-400 border-white/10';
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] bg-zinc-900 border border-white/10 text-white p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            Review Proposals
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Manage and review incoming proposals.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 h-full bg-zinc-900">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                            <Mail className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No proposals received yet.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[55vh] pr-4 -mr-4">
                            <div className="space-y-4 pr-4 pb-4">
                                <AnimatePresence>
                                    {proposals.map((proposal, index) => (
                                        <motion.div
                                            key={proposal._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group bg-white/5 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
                                        >
                                            <div className="flex flex-col md:flex-row gap-5">
                                                {/* Avatar & Basic Info */}
                                                <div className="flex-shrink-0 flex flex-col items-start gap-2 w-full md:w-40">
                                                    <div className="flex items-center gap-3 md:flex-col md:items-start">
                                                        <UserAvatar
                                                            user={proposal.freelancer}
                                                            className="h-12 w-12 border border-white/10"
                                                        />
                                                        <div>
                                                            <h3 className="font-medium text-white text-sm">
                                                                {proposal.freelancer.fullName}
                                                            </h3>
                                                            <p className="text-xs text-zinc-500">
                                                                {proposal.freelancer.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Skills Tags */}
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {proposal.freelancer.skills?.slice(0, 3).map(skill => (
                                                            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-4 text-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-zinc-500">Rate</span>
                                                                <span className="font-medium text-white flex items-center gap-1">
                                                                    {jobCurrency === 'INR' ? '₹' : <Target className="w-3 h-3" />}
                                                                    {proposal.proposedRate}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-zinc-500">Delivery</span>
                                                                <span className="font-medium text-white flex items-center gap-1">
                                                                    <Clock className="w-3 h-3 text-zinc-500" />
                                                                    {proposal.deliveryTime}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium border ${getStatusBadgeVariant(proposal.status)}`}
                                                        >
                                                            {proposal.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>

                                                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                                        <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap line-clamp-3">
                                                            {proposal.coverLetter}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {proposal.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                                                    <Button
                                                        onClick={() => onMessage?.(proposal.freelancer._id, proposal.freelancer.fullName, proposal.freelancer.image)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5"
                                                    >
                                                        <Mail className="w-3 h-3 mr-2" />
                                                        Chat
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                                                        size="sm"
                                                        className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-medium"
                                                    >
                                                        Accept & Hire
                                                    </Button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    )
}
