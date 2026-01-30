"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MilestoneStepper } from "./milestone-stepper";
import { UserAvatar } from "./user-avatar";
import { ChevronLeft, FileText, Bot, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStatusStyles } from "@/lib/contract-utils";
import RaiseDisputeModal from "./raise-dispute-modal";

const InfoCard = ({ user, role }: { user: any, role: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-sm text-neutral-400 mb-4">{role}</p>
        <div className="flex items-center gap-4">
            <UserAvatar user={user} className="w-12 h-12" />
            <div>
                <h4 className="text-lg font-bold text-white">{user?.fullName || 'N/A'}</h4>
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

export function ContractDetailView({ contract, userRole, userId, onBack, onDisputeCreated }: ContractDetailViewProps) {
    const currency = (contract.paymentType || '').toLowerCase().includes('crypto') ? 'ETH' : 'INR';
    const [showDisputeModal, setShowDisputeModal] = useState(false);

    // Determine the other party for the dispute
    const againstUserId = userRole === 'client'
        ? contract.freelancer?._id
        : contract.client?._id;

    // Can only raise dispute on active/in-progress contracts
    const canRaiseDispute = ['active', 'in_progress', 'pending'].includes(contract.status?.toLowerCase());

    const handleDisputeSuccess = () => {
        setShowDisputeModal(false);
        onDisputeCreated?.();
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
                            <Badge className={`${getStatusStyles(contract.status)} text-base px-4 py-2 rounded-lg`}>
                                {contract.status}
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
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-neutral-400">Total Contract Value</p>
                            <p className="text-4xl font-bold text-white">{formatCurrency(parseFloat(contract.totalAmount), currency)}</p>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white leading-tight">
                        {contract.job?.title || 'Contract'}
                    </h1>
                </header>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <h2 className="text-3xl font-bold text-white mb-6">Milestone Progress</h2>
                        <MilestoneStepper milestones={contract.milestones || []} currency={currency} />
                    </motion.div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-2xl font-bold text-white mb-4">Parties</h3>
                        <div className="space-y-4">
                            <InfoCard user={contract.client} role="Client" />
                            <InfoCard user={contract.freelancer} role="Freelancer" />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <h3 className="text-2xl font-bold text-white mb-4">Contract AI Assistant</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <Bot className="mx-auto w-12 h-12 text-blue-400 mb-4" />
                            <p className="text-neutral-300">Our AI is monitoring this contract to ensure fairness and clarity. Have a question about a term? Ask our assistant.</p>
                            <Button variant="outline" className="mt-6 bg-transparent border-white/20 text-white hover:bg-white/10">
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
                contractId={contract._id}
                userId={userId}
                userRole={userRole as "client" | "freelancer"}
                againstUserId={againstUserId}
                onSuccess={handleDisputeSuccess}
            />
        </div>
    );
}
