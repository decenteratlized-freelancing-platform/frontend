"use client"

import React, { useState, useEffect } from "react"
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
} from "lucide-react"
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyToggle from "@/components/shared/currency-toggle";

// Define the Freelancer interface to match backend data
interface Freelancer {
  _id: string // MongoDB ID
  name: string
  email: string
  role: "freelancer" | "client" // Assuming a role field from backend
  walletAddress?: string
  skills: string[]
  bio: string
  hourlyRate: number // Renamed from 'rate'
  status: "Available" | "Busy" // Example status
  location: string
  responseTime: string // e.g., "2 hours", "24 hours"
  isFavorite: boolean // Managed client-side
  profilePicture: string // Renamed from 'avatar'
  // Adjusted portfolio structure based on common practices, assuming an array of objects
  portfolio: { id: number; title: string; imageUrl?: string }[]
  languages: string[]
  projectsCompleted: number // Renamed from 'projects'
  totalEarned: number // e.g., "120k+", "$50,000"
  averageRating: number // Renamed from 'rating'
  reviewsCount: number // Renamed from 'reviews'
}

const SkillChip = ({ skill }: { skill: string }) => (
  <div className="bg-blue-900/50 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">
    {skill}
  </div>
)

const FreelancerCard = ({
  freelancer,
  onViewProfile,
  onHire,
  onToggleFavorite,
}: {
  freelancer: Freelancer
  onViewProfile: (freelancer: Freelancer) => void
  onHire: (freelancer: Freelancer) => void
  onToggleFavorite: (id: string) => void // ID is now string (_id)
}) => {
  const { getConvertedAmount } = useCurrency();
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:bg-white/10">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <img
            src={freelancer.profilePicture || "https://i.pravatar.cc/150"} // Use profilePicture or a placeholder
            alt={freelancer.name}
            className="w-16 h-16 rounded-full border-2 border-white/20"
          />
          <div>
            <h3 className="text-xl font-bold text-white">{freelancer.name}</h3>
            <p className="text-gray-400">{freelancer.role}</p>
          </div>
        </div>
        <button onClick={() => onToggleFavorite(freelancer._id)}>
          <Heart
            className={`w-6 h-6 transition-colors ${
              freelancer.isFavorite
                ? "text-blue-400 fill-current"
                : "text-gray-500 hover:text-blue-400"
            }`}
          />
        </button>
      </div>

      <div className="my-4 flex items-center justify-between text-sm text-gray-300">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-white">{freelancer.averageRating || "N/A"}</span>
          <span className="text-gray-400">({freelancer.reviewsCount} reviews)</span>
        </div>
        <div className="text-green-400 font-bold text-lg">
          {getConvertedAmount(freelancer.hourlyRate)}/hr
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-2 ${
              freelancer.status === "Available"
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                freelancer.status === "Available"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            ></span>
            <span>{freelancer.status}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{freelancer.location}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Response time: {freelancer.responseTime}</span>
        </div>
      </div>

      <p className="my-4 text-gray-300 text-sm leading-relaxed h-12 overflow-hidden">
        {freelancer.bio}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {freelancer.skills.slice(0, 4).map(skill => (
          <SkillChip key={skill} skill={skill} />
        ))}
      </div>

      <div className="flex space-x-3 text-sm">
        <button
          onClick={() => onViewProfile(freelancer)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          View Profile
        </button>
        <button className="flex-1 border border-white/20 text-white hover:bg-white/10 bg-transparent font-bold py-2 px-4 rounded-lg transition-colors">
          Message
        </button>
        <button
          onClick={() => onHire(freelancer)}
          className="flex-1 border border-white/20 text-white hover:bg-white/10 bg-transparent font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Hire
        </button>
      </div>
    </div>
  )
}

const FilterBar = ({
  count,
  totalCount, // Added totalCount prop
  searchTerm,
  onSearchChange,
}: {
  count: number
  totalCount: number // Added totalCount prop
  searchTerm: string
  onSearchChange: (term: string) => void
}) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
    <div className="relative flex-1 md:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search by name, role, or skill..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full bg-gray-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 md:ml-4">
      {["Skills", "Availability", "Rates", "Locations"].map(filter => (
        <button
          key={filter}
          className="flex items-center justify-between w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white hover:bg-gray-800/50"
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
)

const FreelancerProfileModal = ({
  freelancer,
  onClose,
}: {
  freelancer: Freelancer | null
  onClose: () => void
}) => {
  const { getConvertedAmount } = useCurrency();
  if (!freelancer) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl shadow-blue-500/10 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            Freelancer Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 flex flex-col items-center text-center">
              <img
                src={freelancer.profilePicture || "https://i.pravatar.cc/150"}
                alt={freelancer.name}
                className="w-32 h-32 rounded-full border-4 border-blue-500/50 mb-4"
              />
              <h3 className="text-2xl font-bold text-white">
                {freelancer.name}
              </h3>
              <p className="text-gray-400 mb-4">{freelancer.role}</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Add to Favorites
              </button>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-8">
                {[
                  { label: "Rating", value: freelancer.averageRating || "N/A" },
                  { label: "Rate", value: `${getConvertedAmount(freelancer.hourlyRate)}/hr` },
                  { label: "Projects", value: freelancer.projectsCompleted },
                  { label: "Earned", value: getConvertedAmount(freelancer.totalEarned) },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="bg-white/5 rounded-xl p-3"
                  >
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-white font-bold text-xl">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* About Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-2">About</h4>
                <p className="text-gray-300 leading-relaxed">
                  {freelancer.bio}
                </p>
              </div>

              {/* Skills Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map(skill => (
                    <SkillChip key={skill} skill={skill} />
                  ))}
                </div>
              </div>

              {/* Portfolio Section */}
              <div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Portfolio
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freelancer.portfolio.map((item, index) => (
                    <div
                      key={item.id || index} // Fallback key
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <h5 className="font-bold text-white">{item.title}</h5>
                      <p className="text-sm text-gray-400 mt-1">
                        Web Application
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const HireFreelancerModal = ({
  freelancer,
  onClose,
}: {
  freelancer: Freelancer | null
  onClose: () => void
}) => {
  const { getConvertedAmount } = useCurrency();
  const [budget, setBudget] = useState(0);
  const [paymentCurrency, setPaymentCurrency] = useState<'INR' | 'ETH'>('INR');
  const [budgetInput, setBudgetInput] = useState("0");
  const INR_TO_ETH = 0.000004;

  useEffect(() => {
    const numericInput = parseFloat(budgetInput) || 0;
    if (paymentCurrency === 'INR') {
        setBudget(numericInput);
    } else { // ETH
        setBudget(numericInput / INR_TO_ETH); // convert ETH input to INR
    }
  }, [budgetInput, paymentCurrency]);


  if (!freelancer) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl shadow-blue-500/10 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            Hire {freelancer.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-8">
          <form
            className="space-y-6"
            onSubmit={e => {
              e.preventDefault()
              alert("Hire request sent!")
              onClose()
            }}
          >
            <div>
              <label
                htmlFor="projectTitle"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
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
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
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
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
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
                <label
                  htmlFor="paymentCurrency"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Payment Currency
                </label>
                <select
                  id="paymentCurrency"
                  value={paymentCurrency}
                  onChange={(e) => setPaymentCurrency(e.target.value as 'INR' | 'ETH')}
                  className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px]"
                >
                  <option value="INR">₹ INR</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>
            <div>
                <label
                  htmlFor="timeline"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
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
                {getConvertedAmount(budget)}
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
  )
}
export default function DiscoverFreelancersPage() {
  const [allFreelancers, setAllFreelancers] = useState<Freelancer[]>([]) // Initialize as empty array
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]) // Initialize as empty array
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true) // Add loading state
  const [error, setError] = useState<string | null>(null) // Add error state
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(
    null
  )
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isHireModalOpen, setIsHireModalOpen] = useState(false)

  // Fetch freelancers from API
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("http://localhost:5000/api/user/freelancers")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Freelancer[] = await response.json()
        
        const USD_TO_INR = 80;

        const processedData = data.map(f => {
          const hourlyRateInINR = (f.hourlyRate || 0) * USD_TO_INR;

          let totalEarnedInINR = 0;
          if (f.totalEarned) {
            const numericValue = parseFloat(f.totalEarned.replace(/[^0-9.-]+/g,""));
            if (!isNaN(numericValue)) {
              totalEarnedInINR = numericValue * USD_TO_INR;
            }
          }

          return {
            _id: f._id,
            name: f.name || "N/A",
            email: f.email || "N/A",
            role: f.role || "freelancer",
            walletAddress: f.walletAddress,
            skills: f.skills || [],
            bio: f.bio || "No bio provided.",
            hourlyRate: hourlyRateInINR,
            status: f.status || "Available",
            location: f.location || "Remote",
            responseTime: f.responseTime || "24 hours",
            isFavorite: false, 
            profilePicture: f.profilePicture || "https://i.pravatar.cc/150",
            portfolio: f.portfolio || [],
            languages: f.languages || [],
            projectsCompleted: f.projectsCompleted || 0,
            totalEarned: totalEarnedInINR,
            averageRating: f.averageRating || 0,
            reviewsCount: f.reviewsCount || 0,
          }
        });

        setAllFreelancers(processedData)
        setFilteredFreelancers(processedData)
      } catch (e: any) {
        setError(e.message || "Failed to fetch freelancers")
        console.error("Error fetching freelancers:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchFreelancers()
  }, []) // Empty dependency array means this runs once on mount

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase()
    const results = allFreelancers.filter( // Filter allFreelancers now
      freelancer =>
        freelancer.name.toLowerCase().includes(lowercasedTerm) ||
        freelancer.role.toLowerCase().includes(lowercasedTerm) ||
        freelancer.skills.some(skill =>
          skill.toLowerCase().includes(lowercasedTerm)
        )
    )
    setFilteredFreelancers(results)
  }, [searchTerm, allFreelancers]) // Depend on allFreelancers now

  const handleToggleFavorite = (id: string) => { // ID is now string (_id)
    const updatedAllFreelancers = allFreelancers.map(f =>
      f._id === id ? { ...f, isFavorite: !f.isFavorite } : f
    )
    setAllFreelancers(updatedAllFreelancers)
    // The useEffect for filtering will automatically re-filter based on the updated allFreelancers
  }

  const handleViewProfile = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer)
    setIsProfileModalOpen(true)
  }

  const handleHire = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer)
    setIsHireModalOpen(true)
  }

  const closeModal = () => {
    setIsProfileModalOpen(false)
    setIsHireModalOpen(false)
    setSelectedFreelancer(null)
  }

  // Render loading, error, or no freelancers found states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-white text-xl">Loading freelancers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-12">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Find Talent</span>
          </div>
          <CurrencyToggle />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Discover{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Freelancers
          </span>
        </h1>
        <p className="mt-3 max-w-md text-lg text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
          Find the perfect freelance expert for your project.
        </p>
      </header>

      <main>
        <FilterBar
          count={filteredFreelancers.length}
          totalCount={allFreelancers.length} // Pass total count
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        {filteredFreelancers.length === 0 && searchTerm === "" && !loading && !error ? (
          <p className="text-white/70 text-center text-lg mt-8">
            No freelancers found.
          </p>
        ) : filteredFreelancers.length === 0 && searchTerm !== "" ? (
          <p className="text-white/70 text-center text-lg mt-8">
            No freelancers match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFreelancers.map(freelancer => (
              <FreelancerCard
                key={freelancer._id} // Use _id as key
                freelancer={freelancer}
                onViewProfile={handleViewProfile}
                onHire={handleHire}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <FreelancerProfileModal
        freelancer={selectedFreelancer}
        onClose={closeModal}
      />
      <HireFreelancerModal
        freelancer={selectedFreelancer}
        onClose={closeModal}
      />
    </div>
  )
}
