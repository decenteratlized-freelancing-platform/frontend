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
import { X, Briefcase, Target, Clock, BarChart, Layers, Tag } from "lucide-react"

// Define a comprehensive Job interface based on what we expect from the backend
interface Job {
    _id: string;
    title: string;
    description: string;
    category: string;
    budgetType: 'fixed' | 'hourly';
    budget: number;
    skills: string[];
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    duration: string;
    paymentCurrency: 'INR' | 'ETH';
    createdAt: string;
    // ... any other fields
}

interface JobDetailsModalProps {
    job: Job | null
    isOpen: boolean
    onClose: () => void
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">{label}</span>
            <span className="text-zinc-200 font-medium">{value}</span>
        </div>
    </div>
);

export function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col p-0 gap-0 shadow-2xl">
                <DialogHeader className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                {job.title}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 text-xs font-medium uppercase tracking-wide">
                                Posted on {new Date(job.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-grow p-6">
                    <div className="space-y-8">
                        {/* Overview Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailRow icon={Layers} label="Category" value={job.category} />
                            <DetailRow icon={BarChart} label="Experience" value={job.experienceLevel} />
                            <DetailRow icon={Clock} label="Duration" value={job.duration} />
                        </div>

                        {/* Description Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Job Description</h3>
                            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
                                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {/* Budget & Payment Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Financials</h3>
                            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <Tag className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-lg">
                        {job.budget} ETH
                      </span>
                    </div>
                                <Badge className={`text-xs font-bold px-3 py-1 rounded-lg border ${job.paymentCurrency === 'ETH' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    {job.paymentCurrency} Payment
                                </Badge>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs bg-zinc-900 text-zinc-300 border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end">
                    <button onClick={onClose} className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-white/5 text-sm">
                        Close Details
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
