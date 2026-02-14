"use client";

import {
  Clock,
  Users,
  Heart,
  Star,
  CheckCircle,
  Tag,
  Calendar,
  Eye,
  Loader2,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/context/CurrencyContext";

interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number | string;
  budgetType?: string;
  skills?: string[];
  category?: string;
  createdAt: string;
  deadline?: string;
  status: string;
  proposalsCount?: number;
  client?: {
    fullName: string;
    image?: string;
  };
}

interface JobCardProps {
  job: Job;
  variant?: "freelancer" | "client" | "compact";
  isSaved?: boolean;
  onSave?: (jobId: string) => void;
  onViewDetails?: (job: Job) => void;
  onApply?: (job: Job) => void;
  onPublish?: (jobId: string) => void;
  onViewProposals?: (jobId: string) => void;
  isPublishing?: boolean;
  hasApplied?: boolean;
}

export function JobCard({
  job,
  variant = "freelancer",
  isSaved = false,
  onSave,
  onViewDetails,
  onApply,
  onPublish,
  onViewProposals,
  isPublishing = false,
  hasApplied = false
}: JobCardProps) {
  const { getConvertedAmount } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full"
    >
      <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group overflow-hidden shadow-xl rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                    {job.category || "New Project"}
                  </Badge>
                  <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">#{job._id.slice(-6)}</span>
                </div>
                {variant === "freelancer" && onSave && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(job._id);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isSaved ? "bg-pink-500/10 text-pink-500" : "text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                )}
              </div>

              <h3 
                className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-3 leading-tight cursor-pointer"
                onClick={() => onViewDetails?.(job)}
              >
                {job.title}
              </h3>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2 max-w-3xl">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.skills?.slice(0, 5).map((skill: string) => (
                  <div key={skill} className="bg-zinc-950 text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-zinc-800">
                    {skill}
                  </div>
                ))}
                {job.skills && job.skills.length > 5 && (
                  <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1.5">
                    +{job.skills.length - 5} MORE
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                    <Tag className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {getConvertedAmount(job.budget)}
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Budget</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Posted On</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{job.proposalsCount || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Proposals</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-64 flex flex-col justify-between pt-4 lg:pt-0 border-l border-zinc-800/50 pl-0 lg:pl-8">
              <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">
                  {variant === "client" ? "Project Status" : "Client Integrity"}
                </p>
                {variant === "client" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        job.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {job.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          job.status === 'completed' ? 'bg-emerald-500' : 
                          job.status === 'in_progress' ? 'bg-blue-500' : 
                          'bg-zinc-600'
                        }`}
                        style={{ width: job.status === 'completed' ? '100%' : job.status === 'in_progress' ? '50%' : '10%' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-bold text-sm border border-zinc-700">
                      {job.client?.fullName?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm truncate">{job.client?.fullName || 'Verified Client'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-zinc-400">4.9/5.0</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                <Button
                  variant="outline"
                  className="w-full h-12 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  onClick={() => onViewDetails?.(job)}
                >
                  View Details
                </Button>
                
                {variant === "freelancer" && (
                  hasApplied ? (
                    <Button disabled className="w-full h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4 mr-2" /> Applied
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-white/5 transition-all"
                      onClick={() => onApply?.(job)}
                    >
                      Apply Now
                    </Button>
                  )
                )}

                {variant === "client" && (
                  <>
                    {job.status === "draft" && onPublish && (
                      <Button
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all"
                        onClick={() => onPublish(job._id)}
                        disabled={isPublishing}
                      >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Publish Project
                      </Button>
                    )}
                    {onViewProposals && (
                      <Button
                        variant="outline"
                        className="w-full h-12 border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-between px-4"
                        onClick={() => onViewProposals(job._id)}
                      >
                        <span>Proposals</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{job.proposalsCount || 0}</span>
                          <ChevronRight className="w-4 h-4 text-zinc-600" />
                        </div>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
