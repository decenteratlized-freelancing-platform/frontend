"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Dot, Clock, ShieldCheck, ArrowRight } from "lucide-react";
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

const formatCurrency = (amount: number, currency: 'INR' | 'ETH') => {
    if (currency === 'ETH') return `${amount.toFixed(4)} ETH`;
    return `₹${amount.toLocaleString('en-IN')}`;
};

export function MilestoneStepper({ milestones, currency }: { milestones: any[], currency: 'INR' | 'ETH' }) {
    if (!milestones || milestones.length === 0) {
        return (
            <div className="text-center py-10 bg-white/5 rounded-2xl">
                <p className="text-neutral-400">No milestones defined for this contract.</p>
            </div>
        );
    }
    
    // A simple way to determine the current step. In a real app, this would be more robust.
    const currentMilestoneIndex = milestones.findIndex(m => m.status !== 'paid' && m.status !== 'completed');

    return (
        <div className="relative pl-8">
            {milestones.map((milestone, index) => {
                const isCompleted = milestone.status === 'paid' || milestone.status === 'completed';
                const isCurrent = index === currentMilestoneIndex;

                return (
                    <div key={milestone._id || index} className="relative pb-12 last:pb-0">
                        {/* Connecting line */}
                        {index < milestones.length - 1 && (
                            <div
                                className={cn(
                                    "absolute top-5 left-[15px] w-0.5 h-full",
                                    isCompleted ? "bg-blue-500" : "bg-gray-700"
                                )}
                            />
                        )}

                        <div className="relative flex items-start space-x-6">
                            <motion.div 
                                className="z-10"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                {isCurrent ? (
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 animate-pulse" />
                                        <Dot className="absolute inset-0 m-auto w-8 h-8 text-white" />
                                    </div>
                                ) : (
                                    getStatusIcon(milestone.status)
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
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-neutral-400">Milestone {index + 1}</p>
                                        <h4 className="text-lg font-bold text-white mt-1">{milestone.description}</h4>
                                    </div>
                                    <p className="text-xl font-bold text-white">
                                        {formatCurrency(parseFloat(milestone.amount), currency)}
                                    </p>
                                </div>

                                {isCurrent && (
                                    <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                                        <p className="text-sm text-blue-300">Action Required</p>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                            Fund & Start <ArrowRight className="w-4 h-4 ml-2"/>
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
