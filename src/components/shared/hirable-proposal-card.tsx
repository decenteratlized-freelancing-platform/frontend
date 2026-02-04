"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { FileSignature } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function HirableProposalCard({ proposal, onHire }: { proposal: any; onHire: () => void; }) {
  const currency = 'ETH'; 


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative p-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-between group"
        >
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-500 to-transparent transition-all duration-500 transform scale-x-0 group-hover:scale-x-100 origin-center"/>
            
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <UserAvatar user={proposal.freelancer} className="w-10 h-10"/>
                    <div>
                        <h4 className="font-bold text-white text-lg">{proposal.freelancer.fullName}</h4>
                        <p className="text-sm text-green-400 font-semibold">Proposal Accepted</p>
                    </div>
                </div>
                <p className="text-neutral-300 text-base leading-snug line-clamp-2">
                    For project: <span className="font-semibold text-white">{proposal.job.title}</span>
                </p>
            </div>

            <div className="mt-6 space-y-4">
                 <div>
                    <p className="text-xs text-neutral-400 uppercase font-semibold">Proposed Rate</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {formatCurrency(parseFloat(proposal.proposedRate), currency)}
                    </p>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5" onClick={onHire}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Create Contract
                </Button>
            </div>
        </motion.div>
    );
}
