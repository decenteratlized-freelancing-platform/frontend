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
import { X, Briefcase, IndianRupeeIcon, Clock, BarChart, Layers, Tag } from "lucide-react"

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
    <div className="flex items-center gap-4 text-sm">
        <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <span className="font-medium text-gray-400 w-32">{label}</span>
        <span className="text-white font-semibold">{value}</span>
    </div>
);

export function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a1b26] border-white/10 text-white flex flex-col">
                <DialogHeader className="border-b border-white/10 pb-4">
                    <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-blue-400" />
                        {job.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 pt-1">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-grow pr-4 -mr-4">
                    <div className="space-y-8 py-6">
                        {/* Overview Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-3">Overview</h3>
                            <DetailRow icon={Layers} label="Category:" value={job.category} />
                            <DetailRow icon={BarChart} label="Experience Level:" value={job.experienceLevel} />
                            <DetailRow icon={Clock} label="Project Duration:" value={job.duration} />
                        </div>

                        {/* Description Section */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3 border-l-4 border-blue-500 pl-3">Job Description</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>

                        {/* Budget & Payment Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-3">Budget & Payment</h3>
                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                                <div>
                                    <DetailRow
                                    icon={job.paymentCurrency === 'INR' ? IndianRupeeIcon : Tag}
                                    label="Budget"
                                    value={`${job.paymentCurrency === 'INR' ? '₹' : ''}${job.budget} ${job.paymentCurrency === 'ETH' ? 'ETH' : ''} (${job.budgetType})`}
                                />
                                </div>
                                <Badge className={`text-base ${job.paymentCurrency === 'ETH' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                                    Pays in {job.paymentCurrency}
                                </Badge>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3 border-l-4 border-blue-500 pl-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-3">
                                {job.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-sm bg-gray-700/50 text-gray-300 border-gray-600/50">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="border-t border-white/10 pt-4 flex justify-end">
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
