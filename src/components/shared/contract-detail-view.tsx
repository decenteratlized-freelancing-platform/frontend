"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MilestoneStepper } from "./milestone-stepper"; 
import { UserAvatar } from "./user-avatar";
import { ChevronLeft, FileText, Bot } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStatusStyles } from "@/lib/contract-utils";

const InfoCard = ({ user, role }: { user: any, role: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-sm text-neutral-400 mb-4">{role}</p>
        <div className="flex items-center gap-4">
            <UserAvatar user={user} className="w-12 h-12"/>
            <div>
                <h4 className="text-lg font-bold text-white">{user?.fullName || 'N/A'}</h4>
                <p className="text-sm text-neutral-300">{user?.email || 'N/A'}</p>
            </div>
        </div>
    </div>
);

export function ContractDetailView({ contract, userRole, onBack }: { contract: any; userRole: string; onBack: () => void; }) {
    const currency = (contract.paymentType || '').toLowerCase().includes('crypto') ? 'ETH' : 'INR';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Button onClick={onBack} variant="ghost" className="mb-8 flex items-center gap-2 text-neutral-300 hover:text-white">
                    <ChevronLeft className="w-5 h-5"/>
                    Back to All Contracts
                </Button>

                <header className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <Badge className={`${getStatusStyles(contract.status)} text-base px-4 py-2 rounded-lg`}>
                            {contract.status}
                        </Badge>
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
                            <InfoCard user={contract.client} role="Client"/>
                            <InfoCard user={contract.freelancer} role="Freelancer"/>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <h3 className="text-2xl font-bold text-white mb-4">Contract AI Assistant</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <Bot className="mx-auto w-12 h-12 text-blue-400 mb-4"/>
                            <p className="text-neutral-300">Our AI is monitoring this contract to ensure fairness and clarity. Have a question about a term? Ask our assistant.</p>
                            <Button variant="outline" className="mt-6 bg-transparent border-white/20 text-white hover:bg-white/10">
                                Ask Assistant
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
