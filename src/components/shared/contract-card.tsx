"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getStatusStyles, getStatusIcon } from "@/lib/contract-utils";
import { formatCurrency } from "@/lib/utils";

interface ContractCardProps {
    contract: any;
    userRole: "client" | "freelancer";
    onClick: () => void;
}

export function ContractCard({ contract, userRole, onClick }: ContractCardProps) {
    const currency = 'ETH';
    const otherParty = userRole === "client" ? contract.freelancer : contract.client;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className="cursor-pointer relative p-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-between group"
        >
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-500 transform scale-x-0 group-hover:scale-x-100 origin-center"/>
            
            <div>
                <div className="flex justify-between items-start mb-4">
                    <Badge className={`${getStatusStyles(contract.status)} border-none text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5`}>
                        {getStatusIcon(contract.status)}
                        {contract.status}
                    </Badge>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {contract.job?.title || 'Contract Title'}
                </h3>

                <div className="flex items-center gap-2 mt-4">
                    <UserAvatar user={otherParty} className="w-6 h-6"/>
                    <span className="text-sm text-neutral-300">{otherParty?.fullName || 'N/A'}</span>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-neutral-400 uppercase font-semibold">Total Value</p>
                <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(parseFloat(contract.totalAmount), currency)}
                </p>
            </div>
        </motion.div>
    );
}
