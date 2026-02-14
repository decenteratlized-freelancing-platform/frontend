"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Briefcase, Clock, BarChart, Layers, Tag, Calendar, User, Zap } from "lucide-react"

interface Job {
    _id: string;
    title: string;
    description: string;
    category: string;
    budgetType: string;
    budget: number | string;
    skills: string[];
    experienceLevel: string;
    duration: string;
    paymentCurrency?: string;
    createdAt: string;
    client?: {
        fullName: string;
        image?: string;
    }
}

interface JobDetailsModalProps {
    job: Job | null
    isOpen: boolean
    onClose: () => void
    onApply?: (job: Job) => void
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shadow-lg shadow-black/20`}>
            <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-zinc-200">{value || "Not specified"}</p>
        </div>
    </div>
);

export function JobDetailsModal({ job, isOpen, onClose, onApply }: JobDetailsModalProps) {
    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col p-0 gap-0 shadow-2xl overflow-hidden rounded-3xl">
                {/* Premium Header */}
                <div className="relative p-8 pb-6 border-b border-zinc-800 bg-zinc-900/20">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-none px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                            {job.category || "Project"}
                        </Badge>
                        <div className="h-4 w-px bg-zinc-800" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-zinc-100" />
                            {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <DialogTitle className="text-3xl font-black text-white leading-tight mb-2">
                        {job.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold">
                            {job.client?.fullName?.[0] || "C"}
                        </div>
                        {job.client?.fullName || "Verified Client"}
                    </div>
                </div>

                <ScrollArea className="flex-grow">
                    <div className="p-8 space-y-10">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={BarChart} label="Experience" value={job.experienceLevel} color="bg-blue-600" />
                            <StatCard icon={Clock} label="Duration" value={job.duration} color="bg-purple-600" />
                            <StatCard icon={Layers} label="Type" value={job.budgetType || "Fixed Price"} color="bg-orange-600" />
                        </div>

                        {/* Budget Highlight */}
                        <div className="bg-emerald-600 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-emerald-900/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Tag className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-0.5">Project Budget</p>
                                    <p className="text-2xl font-black text-white">{job.budget} ETH</p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Briefcase className="w-3 h-3 text-indigo-500" />
                                Project Overview
                            </h3>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-zinc-300 leading-relaxed text-base bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" />
                                Tech Stack & Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills?.map((skill) => (
                                    <span key={skill} className="px-4 py-2 bg-zinc-900 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer Action */}
                <div className="p-8 border-t border-zinc-800 bg-zinc-900/20 flex gap-4">
                    <button 
                        onClick={onClose} 
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all text-sm"
                    >
                        Dismiss
                    </button>
                    {onApply && (
                        <button 
                            onClick={() => {
                                onApply(job);
                                onClose();
                            }}
                            className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl transition-all text-sm shadow-xl shadow-white/5"
                        >
                            Apply Now
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
