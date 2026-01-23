"use client"

import { useState, useEffect } from "react"
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
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/useCurrentUser"

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
    status: "pending" | "accepted" | "rejected"
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

    useEffect(() => {
        if (isOpen && jobId) {
            fetchProposals()
            fetchJobDetails()
        }
    }, [isOpen, jobId])

    const fetchJobDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
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
            const res = await fetch(`http://localhost:5000/api/proposals/job/${jobId}`)
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
            const res = await fetch(`http://localhost:5000/api/proposals/${proposalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    status,
                    clientEmail: currentUser.email 
                }),
            })

            if (res.ok) {
                toast.success(`Proposal ${status} successfully`)
                // Update local state
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] bg-[#1a1b26] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Review Proposals</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Review and manage proposals for this job posting.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No proposals received yet.
                        </div>
                    ) : (
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-4">
                                {proposals.map((proposal) => (
                                    <div
                                        key={proposal._id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <UserAvatar 
                                                    user={proposal.freelancer} 
                                                    className="h-12 w-12 border border-white/10"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-lg">{proposal.freelancer.fullName}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <Mail className="w-3 h-3" />
                                                        {proposal.freelancer.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`
                          ${proposal.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/50' : ''}
                          ${proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/50' : ''}
                          ${proposal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : ''}
                        `}
                                            >
                                                {proposal.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/10">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <span className="font-medium">
                                                    {jobCurrency === 'INR' ? `₹${proposal.proposedRate}` : `${proposal.proposedRate} ETH`}
                                                </span>
                                                <span className="text-xs text-gray-500">Proposed Rate</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                <span className="font-medium">{proposal.deliveryTime}</span>
                                                <span className="text-xs text-gray-500">Delivery Time</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Cover Letter</h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {proposal.coverLetter}
                                            </p>
                                        </div>

                                        {proposal.status === 'pending' && (
                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Accept Proposal
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                                                    variant="destructive"
                                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() => onMessage?.(proposal.freelancer._id, proposal.freelancer.fullName, proposal.freelancer.image)}
                                                    variant="outline"
                                                    className="border-white/20 text-white hover:bg-white/10"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
