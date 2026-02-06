"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Dot, Clock, ShieldCheck, ArrowRight, Unlock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusIcon = (status?: string) => {
    const s = (status ?? "").toString().toLowerCase();
    switch (s) {
        case "paid":
        case "completed":
            return <CheckCircle className="w-8 h-8 text-green-400" />;
        case "funded":
            return <ShieldCheck className="w-8 h-8 text-blue-400" />;
        case "pending":
        case "created":
            return <Clock className="w-8 h-8 text-yellow-400" />;
        default:
            return <Circle className="w-8 h-8 text-gray-600" />;
    }
};

interface MilestoneStepperProps {
    milestones: any[];
    currency?: string;
    userRole?: string;
    contractStatus?: string;
    onRelease?: (index: number) => void;
    onDownloadInvoice?: (milestone: any, index: number) => void;
}

export function MilestoneStepper({ milestones, currency, userRole, contractStatus, onRelease, onDownloadInvoice }: MilestoneStepperProps) {
    // A simple way to determine the current step. In a real app, this would be more robust.
    const currentMilestoneIndex = milestones.findIndex(m => 
        m.status !== 'paid' && m.status !== 'completed' && m.status !== 'approved'
    );

    return (
        <div className="relative pl-8">
            {milestones.map((milestone, index) => {
                const isCompleted = milestone.status === 'paid' || milestone.status === 'completed' || milestone.status === 'approved';
                const isCurrent = index === currentMilestoneIndex;
                const canRelease = userRole === 'client' && contractStatus?.toLowerCase() === 'funded' && !isCompleted && onRelease && index === currentMilestoneIndex;

                return (
                    <div key={milestone._id || index} className="relative pb-12 last:pb-0">
                        {/* Connecting line */}
                        {index < milestones.length - 1 && (
                            <div
                                className={cn(
                                    "absolute top-5 left-[-17px] w-0.5 h-full",
                                    isCompleted ? "bg-blue-500" : "bg-gray-700"
                                )}
                            />
                        )}

                        <div className="relative flex items-start space-x-6">
                            <motion.div 
                                className="absolute left-[-25px] z-10"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                {isCurrent ? (
                                    <div className="relative">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse mt-2" />
                                        <Dot className="absolute inset-0 m-auto w-8 h-8 text-white" />
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        {getStatusIcon(milestone.status)}
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                className={cn(
                                    "p-6 rounded-2xl border transition-all duration-300 w-full",
                                    isCurrent ? "bg-white/10 border-blue-500/50" : "bg-white/[0.02] border-white/10"
                                )}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-400">Milestone {index + 1}</p>
                                        <h4 className="text-lg font-bold text-white mt-1">{milestone.description}</h4>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="text-xs font-bold text-zinc-400 whitespace-nowrap bg-white/5 px-2 py-1 rounded">
                                            {milestone.amount} {currency || 'ETH'}
                                        </span>
                                        {isCompleted && onDownloadInvoice && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDownloadInvoice(milestone, index)}
                                                className="h-7 text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 border-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all"
                                            >
                                                <FileText className="w-3 h-3 mr-1.5" />
                                                Invoice
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {canRelease && (
                                    <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                                        <p className="text-sm text-blue-300 font-medium">Milestone Ready for Approval</p>
                                        <Button 
                                            onClick={() => onRelease && onRelease(index)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            <Unlock className="w-4 h-4 mr-2"/> Release Funds
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
