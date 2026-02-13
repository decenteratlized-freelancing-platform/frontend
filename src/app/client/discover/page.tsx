"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Star,
  Heart,
  X,
  Users,
  Sparkles,
  Loader2,
  MessageSquare,
  Briefcase,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Wallet
} from "lucide-react"
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast, toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define the Freelancer interface to match backend data
interface Freelancer {
  _id: string;
  fullName: string;
  email: string;
  role: "freelancer" | "client";
  walletAddress?: string;
  skills: string[];
  bio: string;
  hourlyRate?: number;
  status: "Available" | "Busy";
  location: string;
  responseTime: string;
  isFavorite: boolean;
  image: string;
  portfolio: { title: string; description: string; url: string }[];
  socialLinks?: { github?: string; linkedin?: string; twitter?: string; website?: string };
  verifiedSkills?: { skill: string; score: number }[];
  languages: string[];
  projectsCompleted: number;
  totalEarned: number;
  averageRating: number;
  reviewsCount: number;
}

const SkillChip = ({ skill }: { skill: string }) => (
  <div className="bg-zinc-800 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-700/50">
    {skill}
  </div>
);

const FreelancerCard = ({
  freelancer,
  onViewProfile,
  onHire,
  onToggleFavorite,
  userRole,
}: {
  freelancer: Freelancer;
  onViewProfile: (freelancer: Freelancer) => void;
  onHire: (freelancer: Freelancer) => void;
  onToggleFavorite: (id: string) => void;
  userRole?: string | null;
}) => {
  const { getConvertedAmount } = useCurrency();
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 group relative overflow-hidden">
      {/* Subtle top light effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center space-x-4 mb-5">
        {freelancer.image ? (
          <Image
            src={freelancer.image}
            alt={freelancer.fullName}
            width={56}
            height={56}
            className="rounded-full border border-zinc-700 object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center">
            <Users className="w-6 h-6 text-zinc-500" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors">{freelancer.fullName}</h3>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-tight">{freelancer.role}</p>
            </div>
            {userRole === "client" && (
              <button onClick={() => onToggleFavorite(freelancer._id)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700">
                <Heart
                  className={`w-4 h-4 transition-colors ${freelancer.isFavorite
                      ? "text-red-500 fill-current"
                      : "text-zinc-500 hover:text-red-400"
                    }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-2 h-10">
        {freelancer.bio}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-6 h-7 overflow-hidden">
        {freelancer.skills.slice(0, 3).map((skill) => (
          <SkillChip key={skill} skill={skill} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-800/50 mb-6 bg-zinc-950/20 rounded-xl px-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Projects</p>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-semibold text-zinc-200">{freelancer.projectsCompleted}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Rating</p>
          <div className="flex items-center justify-end space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-zinc-200">{freelancer.averageRating || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
         <div className="text-zinc-100 font-bold text-xl">
            {/* Rate removed as per fixed-price model */}
          </div>
          <div className="flex items-center gap-3">
            {!freelancer.walletAddress && (
                <Badge variant="outline" className="text-[9px] border-red-500/50 text-red-400 bg-red-500/5 px-2 py-0">No Wallet</Badge>
            )}
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${freelancer.status === "Available" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500"}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{freelancer.status}</span>
            </div>
          </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile(freelancer)}
          className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-white/5"
        >
          View Profile
        </button>
        <Link href={`/client/messages?receiverId=${freelancer._id}`} className="flex-none">
          <button className="flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white p-3 rounded-xl transition-colors border border-zinc-800">
            <MessageSquare className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
};

const FilterBar = ({
  count,
  totalCount,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}: {
  count: number;
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: any;
  onFilterChange: (key: string, value: string) => void;
}) => (
  <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center">
    <div className="relative w-full lg:max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        placeholder="Search by talent or expertise..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all text-sm"
      />
    </div>
    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-1">
      <Select value={filters.status} onValueChange={(val) => onFilterChange('status', val)}>
        <SelectTrigger className="w-[140px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-xs font-bold uppercase tracking-wider h-auto">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
          <SelectItem value="all">Any Status</SelectItem>
          <SelectItem value="Available">Available</SelectItem>
          <SelectItem value="Busy">Busy</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="hidden lg:flex items-center text-zinc-500 text-[11px] font-bold uppercase tracking-widest ml-auto">
      Found <span className="text-zinc-200 mx-1.5">{count}</span> matched experts
    </div>
  </div>
);

const FreelancerProfileModal = ({
  freelancer,
  onClose,
  onHire,
}: {
  freelancer: Freelancer | null;
  onClose: () => void;
  onHire: (freelancer: Freelancer) => void;
}) => {
  const { getConvertedAmount } = useCurrency();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (freelancer?._id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/reviews/${freelancer._id}`);
          if (res.ok) {
            const data = await res.json();
            setReviews(data);
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [freelancer]);

  if (!freelancer) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Expert Profile
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 p-2 hover:bg-zinc-800 rounded-xl transition-colors border border-transparent hover:border-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative mb-6">
                {freelancer.image ? (
                  <Image
                    src={freelancer.image}
                    alt={freelancer.fullName}
                    width={160}
                    height={160}
                    className="w-40 h-40 rounded-3xl border border-zinc-700 object-cover"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-3xl border border-zinc-700 bg-zinc-800 flex items-center justify-center">
                    <Users className="w-16 h-16 text-zinc-600" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-zinc-900 shadow-xl" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-1">{freelancer.fullName}</h3>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-4">{freelancer.role}</p>
              
              {/* Social Links */}
              {freelancer.socialLinks && (
                <div className="flex gap-3 justify-center mb-8">
                  {freelancer.socialLinks.github && (
                    <a href={`https://${freelancer.socialLinks.github.replace(/^https?:\/\//, '')}`} target="_blank" className="text-zinc-400 hover:text-white p-2 bg-zinc-800/50 rounded-lg transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {freelancer.socialLinks.linkedin && (
                    <a href={`https://${freelancer.socialLinks.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" className="text-zinc-400 hover:text-white p-2 bg-zinc-800/50 rounded-lg transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {freelancer.socialLinks.twitter && (
                    <a href={`https://twitter.com/${freelancer.socialLinks.twitter.replace('@', '')}`} target="_blank" className="text-zinc-400 hover:text-white p-2 bg-zinc-800/50 rounded-lg transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {freelancer.socialLinks.website && (
                    <a href={freelancer.socialLinks.website} target="_blank" className="text-zinc-400 hover:text-white p-2 bg-zinc-800/50 rounded-lg transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              <div className="w-full flex flex-col gap-4">
                <button 
                  onClick={() => onHire(freelancer)}
                  className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-4 rounded-2xl transition-all shadow-xl shadow-white/5"
                >
                  Hire Expert
                </button>
                <Link href={`/client/messages?receiverId=${freelancer._id}`} className="w-full">
                  <button className="w-full bg-zinc-800/50 text-zinc-300 font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-colors border border-zinc-700/50">
                    Contact
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Rating", value: `${freelancer.averageRating || "N/A"}` },
                  { label: "Done", value: `${freelancer.projectsCompleted}` },
                  { label: "Earned", value: getConvertedAmount(freelancer.totalEarned) },
                  { 
                    label: "Wallet", 
                    value: freelancer.walletAddress 
                        ? `${freelancer.walletAddress.slice(0, 6)}...${freelancer.walletAddress.slice(-4)}` 
                        : "Not Linked",
                    isWarning: !freelancer.walletAddress
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-4">
                    <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                    <p className={`font-bold text-base truncate ${stat.isWarning ? 'text-red-400' : 'text-zinc-200'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Biography</h4>
                <p className="text-zinc-400 leading-relaxed text-sm bg-zinc-950/20 p-6 rounded-2xl border border-zinc-800/50">
                  {freelancer.bio}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Core Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <div key={skill} className="bg-zinc-800 text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-700/50">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Client Feedback</h4>
                <div className="space-y-4">
                  {loadingReviews ? (
                    <p className="text-zinc-500 text-xs animate-pulse">Loading reviews...</p>
                  ) : reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <div key={idx} className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-800"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 ml-2 uppercase tracking-widest">{review.reviewerName}</span>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed mb-2 italic">&quot;{review.comment}&quot;</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                           <Briefcase className="w-2.5 h-2.5" /> {review.projectTitle}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No reviews yet</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Selected Works</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freelancer.portfolio.length > 0 ? (
                    freelancer.portfolio.map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-950/40 rounded-2xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors group cursor-pointer"
                      >
                        <div className="aspect-video bg-zinc-950 rounded-xl mb-4 overflow-hidden border border-zinc-800 relative">
                          {item.url ? (
                            <Image
                              src={item.url}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-zinc-900 text-[10px] font-bold uppercase tracking-widest">
                              No Preview
                            </div>
                          )}
                        </div>
                        <h5 className="font-bold text-zinc-200 text-sm truncate">{item.title}</h5>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Gallery Empty</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const HireFreelancerModal = ({
  freelancer,
  onClose,
}: {
  freelancer: Freelancer | null;
  onClose: () => void;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureToken = useCallback(async () => {
    let token = localStorage.getItem("token");
    if (!token && session?.user?.email) {
        try {
            const devRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/dev-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email })
            });
            if (devRes.ok) {
                const data = await devRes.json();
                token = data.token;
                localStorage.setItem("token", token || "");
            }
        } catch (e) { console.error("Auto-token failed", e); }
    }
    return token;
  }, [session]);

  useEffect(() => {
    const fetchJobs = async () => {
      const email = session?.user?.email;
      if (!email) return;

      try {
        const token = await ensureToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/jobs/my-jobs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter only open jobs
          const openJobs = data.filter((job: any) => job.status === "open");
          setJobs(openJobs);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load your jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session, ensureToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    if (!freelancer?.walletAddress) {
        toast({
            title: "Cannot Hire",
            description: "This freelancer hasn't linked a wallet yet. They must link a wallet before they can be hired.",
            variant: "destructive"
        });
        return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contracts/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: session?.user?.email,
          freelancerId: freelancer?._id,
          jobId: selectedJobId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create contract");
      }

      const data = await res.json();
      router.push(`/client/contracts/${data.contractId}`);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (!freelancer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Hire {freelancer.fullName}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
          ) : !freelancer.walletAddress ? (
            <div className="text-center py-6">
              <Wallet className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">No Wallet Linked</h3>
              <p className="text-zinc-500 mb-6 text-sm">
                This freelancer hasn&apos;t linked a crypto wallet to their profile. Blockchain-secured contracts require both parties to have linked wallets.
              </p>
              <Button onClick={onClose} variant="outline" className="border-zinc-800 text-zinc-300">
                Close
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-6">
              <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">No Open Jobs Found</h3>
              <p className="text-zinc-500 mb-6 text-sm">
                You need to post a job before you can hire a freelancer directly.
              </p>
              <Link href="/client/post-job">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors text-sm">
                  Post a Job Now
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Select a Job to Offer
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  required
                >
                  <option value="" disabled>-- Select a published job --</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} ({job.budget} ETH)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-2">
                  Only &quot;Open&quot; jobs are shown. Selecting a job will create a contract draft.
                </p>
              </div>

              {selectedJobId && (
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-blue-200 font-medium text-sm">Next Step: Contract Review</h4>
                      <p className="text-blue-200/60 text-xs mt-1 leading-relaxed">
                        You will be redirected to the contract page to review milestones and sign the agreement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-zinc-800 text-zinc-300 hover:bg-zinc-900 bg-transparent font-medium py-2.5 px-5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedJobId || creating}
                  className="bg-white text-zinc-950 font-bold py-2.5 px-6 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm shadow-lg shadow-white/5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  Create Contract
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DiscoverFreelancersPage() {
  const [allFreelancers, setAllFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const { data: session } = useSession();
  
  // Filter States
  const [filters, setFilters] = useState({
    status: 'all'
  });

  const ensureToken = useCallback(async () => {
    let token = localStorage.getItem("token");
    if (!token && session?.user?.email) {
        try {
            const devRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/dev-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email })
            });
            if (devRes.ok) {
                const data = await devRes.json();
                token = data.token;
                localStorage.setItem("token", token || "");
            }
        } catch (e) { console.error("Auto-token failed", e); }
    }
    return token;
  }, [session]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await ensureToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/freelancers`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: any[] = await response.json();

        const processedData: Freelancer[] = data.map((f: any) => {
          const settings = f.settings || {};

          return {
            _id: f._id,
            fullName: f.fullName || "N/A",
            email: f.email || "N/A",
            role: f.role || "freelancer",
            skills: typeof settings.skills === 'string' && settings.skills ? settings.skills.split(',').map((s: string = "") => s.trim()) : [],
            bio: settings.bio || "No bio provided.",
            status: settings.availableForJobs ? "Available" : "Busy",
            location: settings.location || "Remote",
            responseTime: f.responseTime || "24 hours",
            isFavorite: f.isFavorite || false,
            image: f.image || "",
            portfolio: settings.portfolio || [],
            socialLinks: settings.socialLinks || {},
            verifiedSkills: settings.verifiedSkills || [],
            languages: f.languages || [],
            projectsCompleted: settings.projectsCompleted || 0,
            totalEarned: settings.totalEarned || 0,
            averageRating: settings.rating || 0,
            reviewsCount: settings.reviewsCount || 0,
          };
        });

        setAllFreelancers(processedData);
        setFilteredFreelancers(processedData);
      } catch (e: any) {
        setError(e.message || "Failed to fetch freelancers");
        console.error("Error fetching freelancers:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, [session, ensureToken]);

  // Filter Logic
  useEffect(() => {
    let results = allFreelancers;

    // Search Term
    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        results = results.filter(
            (freelancer) =>
              freelancer.fullName.toLowerCase().includes(lowercasedTerm) ||
              freelancer.role.toLowerCase().includes(lowercasedTerm) ||
              freelancer.skills.some((skill) =>
                skill.toLowerCase().includes(lowercasedTerm)
              )
          );
    }

    // Status Filter
    if (filters.status !== 'all') {
        results = results.filter(f => f.status === filters.status);
    }

    setFilteredFreelancers(results);
  }, [searchTerm, allFreelancers, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleFavorite = async (id: string) => {
    const freelancer = allFreelancers.find(f => f._id === id);
    const isFavorite = freelancer?.isFavorite;
    const token = await ensureToken();
    
    if (!token) {
        toast({ title: "Auth Required", description: "Please log in to save favorites.", variant: "destructive" });
        return;
    }

    try {
        const endpoint = isFavorite ? "/api/user/favorites/remove" : "/api/user/favorites/add";
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ freelancerId: id })
        });

        if (res.ok) {
            const updatedAllFreelancers = allFreelancers.map((f) =>
                f._id === id ? { ...f, isFavorite: !f.isFavorite } : f
            );
            setAllFreelancers(updatedAllFreelancers);
            toast({ title: isFavorite ? "Removed" : "Saved", description: isFavorite ? "Freelancer removed from favorites" : "Freelancer saved to favorites" });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
    }
  };

  const handleViewProfile = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsProfileModalOpen(true);
  };

  const handleHire = (freelancer: Freelancer) => {
    if (!session?.user?.walletAddress) {
        toast({
            title: "Wallet Required",
            description: "You must link a crypto wallet to your profile before you can hire freelancers. Please go to Settings to link your wallet.",
            variant: "destructive"
        });
        return;
    }
    setSelectedFreelancer(freelancer);
    setIsProfileModalOpen(false); // Close profile first
    setIsHireModalOpen(true);
  };

  const closeModal = () => {
    setIsProfileModalOpen(false);
    setIsHireModalOpen(false);
    setSelectedFreelancer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-zinc-400 text-lg">Loading freelancers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-red-500 text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-950 min-h-screen">
      <header className="mb-12">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-2.5 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">Find Talent</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
          Discover{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
            Freelancers
          </span>
        </h1>
        <p className="mt-3 max-w-md text-lg text-zinc-400">
          Find the perfect freelance expert for your project.
        </p>
      </header>

      <main>
        <FilterBar
          count={filteredFreelancers.length}
          totalCount={allFreelancers.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        {filteredFreelancers.length === 0 && !loading ? (
          <p className="text-zinc-500 text-center text-lg mt-12">
            {searchTerm ? "No freelancers match your search." : "No freelancers found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer._id}
                freelancer={freelancer}
                onViewProfile={handleViewProfile}
                onHire={handleHire}
                onToggleFavorite={handleToggleFavorite}
                userRole={session?.user?.role}
              />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isProfileModalOpen && (
          <FreelancerProfileModal
            freelancer={selectedFreelancer}
            onClose={closeModal}
            onHire={handleHire}
          />
        )}
        {isHireModalOpen && (
          <HireFreelancerModal
            freelancer={selectedFreelancer}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
