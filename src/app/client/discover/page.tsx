"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Star,
  MapPin,
  Clock,
  Heart,
  X,
  Users,
  Sparkles,
  Loader2,
  MessageSquare,
} from "lucide-react"
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyToggle from "@/components/shared/currency-toggle";

// Define the Freelancer interface to match backend data
interface Freelancer {
  _id: string;
  fullName: string;
  email: string;
  role: "freelancer" | "client";
  walletAddress?: string;
  skills: string[];
  bio: string;
  hourlyRate: number;
  status: "Available" | "Busy";
  location: string;
  responseTime: string;
  isFavorite: boolean;
  image: string;
  portfolio: { id: number; title: string; imageUrl?: string }[];
  languages: string[];
  projectsCompleted: number;
  totalEarned: number;
  averageRating: number;
  reviewsCount: number;
}

const SkillChip = ({ skill }: { skill: string }) => (
  <div className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
    {skill}
  </div>
);

const FreelancerCard = ({
  freelancer,
  onViewProfile,
  onHire,
  onToggleFavorite,
}: {
  freelancer: Freelancer;
  onViewProfile: (freelancer: Freelancer) => void;
  onHire: (freelancer: Freelancer) => void;
  onToggleFavorite: (id: string) => void;
}) => {
  const { getConvertedAmount } = useCurrency();
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200/80">
      <div className="flex items-center space-x-4 mb-4">
        {freelancer.image ? (
          <img
            src={freelancer.image}
            alt={freelancer.fullName}
            className="w-20 h-20 rounded-full border-4 border-white shadow-sm object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm bg-gray-200 flex items-center justify-center">
            <Users className="w-10 h-10 text-gray-500" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{freelancer.fullName}</h3>
              <p className="text-gray-500 capitalize">{freelancer.role}</p>
            </div>
            <button onClick={() => onToggleFavorite(freelancer._id)}>
              <Heart
                className={`w-6 h-6 transition-colors ${freelancer.isFavorite
                    ? "text-red-500 fill-current"
                    : "text-gray-400 hover:text-red-500"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {freelancer.bio.substring(0, 100)}{freelancer.bio.length > 100 && "..."}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {freelancer.skills.slice(0, 4).map((skill) => (
          <SkillChip key={skill} skill={skill} />
        ))}
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-bold text-gray-800">{freelancer.projectsCompleted}</span>
            <span className="text-gray-500">Projects Completed</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-gray-800">{freelancer.averageRating || "N/A"}</span>
            <span className="text-gray-500">({freelancer.reviewsCount} reviews)</span>
          </div>
          <div className="text-blue-600 font-bold text-lg">
            {getConvertedAmount(freelancer.hourlyRate, 'INR')}/hr
          </div>
        </div>
      </div>

      <div className="mt-6 flex space-x-3 text-sm">
        <button
          onClick={() => onViewProfile(freelancer)}
          className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all hover:bg-blue-700"
        >
          View Profile
        </button>
        <Link href={`/client/messages?receiverId=${freelancer._id}`} className="flex-1">
          <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-4 rounded-lg transition-colors">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
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
}: {
  count: number;
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) => (
  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
    <div className="relative flex-1 md:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        placeholder="Search by name, role, or skill..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 md:ml-4">
      {["Skills", "Availability", "Rates", "Locations"].map((filter) => (
        <button
          key={filter}
          className="flex items-center justify-between w-full bg-gray-900 border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-800"
        >
          <span>{filter}</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      ))}
    </div>
    <div className="hidden md:block text-gray-400 text-sm md:ml-6 whitespace-nowrap">
      Showing <strong>{count}</strong> of <strong>{totalCount}</strong>{" "}
      freelancers
    </div>
  </div>
);

const FreelancerProfileModal = ({
  freelancer,
  onClose,
}: {
  freelancer: Freelancer | null;
  onClose: () => void;
}) => {
  const { getConvertedAmount } = useCurrency();
  if (!freelancer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Freelancer Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center text-center">
              {freelancer.image ? (
                <img
                  src={freelancer.image}
                  alt={freelancer.fullName}
                  className="w-32 h-32 rounded-full border-4 border-blue-500/50 mb-4 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-blue-500/50 mb-4 bg-gray-200 flex items-center justify-center">
                  <Users className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900">{freelancer.fullName}</h3>
              <p className="text-gray-500 mb-4 capitalize">{freelancer.role}</p>
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Hire Me
              </button>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-8">
                {[
                  { label: "Rating", value: `${freelancer.averageRating || "N/A"} ★` },
                  { label: "Rate", value: `${getConvertedAmount(freelancer.hourlyRate, "INR")}/hr` },
                  { label: "Projects", value: freelancer.projectsCompleted },
                  { label: "Earned", value: getConvertedAmount(freelancer.totalEarned, "INR") },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-100 rounded-xl p-3">
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-gray-900 font-bold text-xl">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-2">About</h4>
                <p className="text-gray-600 leading-relaxed">{freelancer.bio}</p>
              </div>
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <SkillChip key={skill} skill={skill} />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Portfolio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freelancer.portfolio.length > 0 ? (
                    freelancer.portfolio.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="bg-gray-100 rounded-lg p-4 border border-gray-200"
                      >
                        <h5 className="font-bold text-gray-800">{item.title}</h5>
                        <p className="text-sm text-gray-500 mt-1">Web Application</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No portfolio items to display.</p>
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
  const { getConvertedAmount } = useCurrency();
  const [budget, setBudget] = useState(0);
  const [paymentCurrency, setPaymentCurrency] = useState<'INR' | 'ETH'>("INR");
  const [budgetInput, setBudgetInput] = useState("0");
  const INR_TO_ETH = 0.000004;

  useEffect(() => {
    const numericInput = parseFloat(budgetInput) || 0;
    if (paymentCurrency === "INR") {
      setBudget(numericInput);
    } else {
      setBudget(numericInput / INR_TO_ETH);
    }
  }, [budgetInput, paymentCurrency]);

  if (!freelancer) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl shadow-blue-500/10 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Hire {freelancer.fullName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-8">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Hire request sent!");
              onClose();
            }}
          >
            <div>
              <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                id="projectTitle"
                className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Build a new marketing website"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the project requirements in detail..."
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  id="budget"
                  className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="paymentCurrency" className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Currency
                </label>
                <select
                  id="paymentCurrency"
                  value={paymentCurrency}
                  onChange={(e) => setPaymentCurrency(e.target.value as "INR" | "ETH")}
                  className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px]"
                >
                  <option value="INR">₹ INR</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
                Timeline
              </label>
              <input
                type="text"
                id="timeline"
                className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4 weeks"
              />
            </div>
            <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
              <span className="text-gray-300">Total Cost</span>
              <span className="text-green-400 font-bold text-xl">
                {getConvertedAmount(budget, paymentCurrency)}
              </span>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="border border-white/20 text-white hover:bg-white/10 bg-transparent font-bold py-2 px-6 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700"
              >
                Send Hire Request
              </button>
            </div>
          </form>
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

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:5000/api/user/freelancers");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: any[] = await response.json();

        const processedData: Freelancer[] = data.map((f) => {
          const settings = f.settings || {};

          let totalEarnedInINR = 0;
          if (typeof f.totalEarned === 'string') {
            const numericValue = parseFloat(f.totalEarned.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(numericValue)) {
              totalEarnedInINR = numericValue;
            }
          } else if (typeof f.totalEarned === 'number') {
            totalEarnedInINR = f.totalEarned;
          }

          return {
            ...f,
            _id: f._id,
            fullName: f.fullName || "N/A",
            email: f.email || "N/A",
            role: f.role || "freelancer",
            skills: typeof settings.skills === 'string' && settings.skills ? settings.skills.split(',').map(s => s.trim()) : [],
            bio: settings.bio || "No bio provided.",
            hourlyRate: settings.hourlyRate || 0,
            status: settings.availableForJobs ? "Available" : "Busy",
            location: settings.location || "Remote",
            responseTime: f.responseTime || "24 hours",
            isFavorite: false,
            image: f.image || "",
            portfolio: settings.portfolioWebsite ? [{ id: 1, title: 'Portfolio Website', imageUrl: settings.portfolioWebsite }] : [],
            languages: f.languages || [],
            projectsCompleted: settings.projectsCompleted || 0,
            totalEarned: totalEarnedInINR,
            averageRating: settings.rating || 0,
            reviewsCount: f.reviewsCount || 0,
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
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = allFreelancers.filter(
      (freelancer) =>
        freelancer.fullName.toLowerCase().includes(lowercasedTerm) ||
        freelancer.role.toLowerCase().includes(lowercasedTerm) ||
        freelancer.skills.some((skill) =>
          skill.toLowerCase().includes(lowercasedTerm)
        )
    );
    setFilteredFreelancers(results);
  }, [searchTerm, allFreelancers]);

  const handleToggleFavorite = (id: string) => {
    const updatedAllFreelancers = allFreelancers.map((f) =>
      f._id === id ? { ...f, isFavorite: !f.isFavorite } : f
    );
    setAllFreelancers(updatedAllFreelancers);
  };

  const handleViewProfile = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsProfileModalOpen(true);
  };

  const handleHire = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsHireModalOpen(true);
  };

  const closeModal = () => {
    setIsProfileModalOpen(false);
    setIsHireModalOpen(false);
    setSelectedFreelancer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-white text-xl">Loading freelancers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-white">
      <header className="mb-12">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Find Talent</span>
          </div>
          <CurrencyToggle />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Discover{" "}
          <span className="text-violet-500 text-transparent">
            Freelancers
          </span>
        </h1>
        <p className="mt-3 max-w-md text-lg text-gray-400 sm:text-xl md:mt-5 md:max-w-3xl">
          Find the perfect freelance expert for your project.
        </p>
      </header>

      <main>
        <FilterBar
          count={filteredFreelancers.length}
          totalCount={allFreelancers.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        {filteredFreelancers.length === 0 && !loading ? (
          <p className="text-gray-400 text-center text-lg mt-8">
            {searchTerm ? "No freelancers match your search." : "No freelancers found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer._id}
                freelancer={freelancer}
                onViewProfile={handleViewProfile}
                onHire={handleHire}
                onToggleFavorite={handleToggleFavorite}
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
