"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/shared/loading-button"
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  Download,
  Edit,
  CheckCircle,
  X,
  Check,
  FileSignature,
  Activity,
  Shield,
  Target,
  CreditCard,
  Users,
  UserPlus,
} from "lucide-react"

interface ContractProps {
  userRole: "client" | "freelancer"
}

const contractsData = [
  {
    id: "c1",
    title: "Website Redesign — Contract",
    client: {
      name: "TechCorp Inc.",
      avatar: "/placeholder.svg?height=40&width=40&text=TC",
      rating: 4.8,
      email: "contact@techcorp.com",
    },
    freelancer: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40&text=JD",
      rating: 4.9,
      email: "john.doe@email.com",
    },
    contractId: "CT-2024-001",
    amount: "$6,500",
    status: "Active",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    progress: 75,
    paymentType: "Fixed",
    paymentMethod: "Escrow",
    description: "Complete website redesign with modern UI/UX, responsive design, and performance optimization.",
    scopeOfWork: [
      "UI/UX Design and Wireframing",
      "Frontend Development (React/Next.js)",
      "Backend Integration",
      "Performance Optimization",
      "Testing and Quality Assurance",
      "Deployment and Launch",
    ],
    clientResponsibilities: [
      "Provide brand guidelines and assets",
      "Review and approve design mockups",
      "Provide content and copy",
      "Test and provide feedback",
    ],
    freelancerResponsibilities: [
      "Deliver high-quality code",
      "Meet project deadlines",
      "Provide regular updates",
      "Ensure cross-browser compatibility",
    ],
    milestones: [
      {
        id: 1,
        title: "Design & Planning",
        completed: true,
        amount: "$1,300",
        deadline: "2024-01-20",
        description: "Complete wireframes and design mockups",
      },
      {
        id: 2,
        title: "Frontend Development",
        completed: true,
        amount: "$2,600",
        deadline: "2024-01-30",
        description: "Implement responsive frontend",
      },
      {
        id: 3,
        title: "Backend Integration",
        completed: false,
        amount: "$1,950",
        deadline: "2024-02-10",
        description: "API integration and database setup",
      },
      {
        id: 4,
        title: "Testing & Launch",
        completed: false,
        amount: "$650",
        deadline: "2024-02-15",
        description: "Quality assurance and deployment",
      },
    ],
    additionalTerms: {
      revisionPolicy: "Up to 3 rounds of revisions included",
      confidentiality: "All project information is confidential",
      termination: "Either party can terminate with 7 days notice",
    },
    activityLog: [
      {
        id: 1,
        action: "Contract Created",
        user: "TechCorp Inc.",
        timestamp: "2024-01-10 10:00 AM",
        details: "Initial contract offer sent",
      },
      {
        id: 2,
        action: "Contract Accepted",
        user: "John Doe",
        timestamp: "2024-01-12 2:30 PM",
        details: "Freelancer accepted the contract terms",
      },
      {
        id: 3,
        action: "Milestone Completed",
        user: "John Doe",
        timestamp: "2024-01-20 4:15 PM",
        details: "Design & Planning milestone completed",
      },
      {
        id: 4,
        action: "Payment Released",
        user: "TechCorp Inc.",
        timestamp: "2024-01-21 9:00 AM",
        details: "$1,300 payment released for milestone 1",
      },
    ],
    signatures: {
      client: {
        signed: true,
        timestamp: "2024-01-12 2:30 PM",
        signature: "TechCorp Inc.",
      },
      freelancer: {
        signed: true,
        timestamp: "2024-01-12 2:30 PM",
        signature: "John Doe",
      },
    },
    lastUpdated: "2024-01-21 9:00 AM",
  },
  // Add more contract data...
]

const getStatusColor = (status?: string) => {
  const s = (status ?? "").toString().toLowerCase()
  switch (s) {
    case "active":
      return "bg-green-500/20 text-green-300 border-green-500/30"
    case "pending":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    case "completed":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30"
    case "cancelled":
    case "rejected":
      return "bg-red-500/20 text-red-300 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }
}

const getStatusIcon = (status?: string) => {
  const s = (status ?? "").toString().toLowerCase()
  switch (s) {
    case "active":
      return <Activity className="w-3 h-3" />
    case "pending":
      return <Clock className="w-3 h-3" />
    case "completed":
      return <CheckCircle className="w-3 h-3" />
    case "cancelled":
    case "rejected":
      return <X className="w-3 h-3" />
    default:
      return <FileText className="w-3 h-3" />
  }
}

export default function UnifiedContract({ userRole }: ContractProps) {
  const role = userRole || "client"

  const [contracts, setContracts] = useState(contractsData)
  const [selectedContract, setSelectedContract] = useState(null)
  const [showContractDialog, setShowContractDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showHireDialog, setShowHireDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreatingContract, setIsCreatingContract] = useState(false)
  const [isUpdatingContract, setIsUpdatingContract] = useState(false)

  const [createFormData, setCreateFormData] = useState({
    title: "",
    freelancerEmail: "",
    description: "",
    amount: "",
    paymentType: "Fixed",
    paymentMethod: "Escrow",
    startDate: "",
    endDate: "",
    scopeOfWork: [""],
    milestones: [{ title: "", amount: "", deadline: "", description: "" }],
    revisionPolicy: "Up to 3 rounds of revisions included",
    confidentiality: "All project information is confidential",
    termination: "Either party can terminate with 7 days notice",
  })

  const [hiredFreelancers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      skills: ["React", "Node.js", "TypeScript"],
      avatar: "/placeholder.svg?height=40&width=40&text=JD",
      rating: 4.9,
      hourlyRate: 85,
      status: "Available",
      hiredDate: "2024-01-10",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      skills: ["UI/UX", "Figma", "Adobe XD"],
      avatar: "/placeholder.svg?height=40&width=40&text=JS",
      rating: 4.8,
      hourlyRate: 65,
      status: "Busy",
      hiredDate: "2024-01-08",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      skills: ["Python", "Django", "PostgreSQL"],
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      rating: 4.7,
      hourlyRate: 75,
      status: "Available",
      hiredDate: "2024-01-12",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      skills: ["Content Writing", "SEO", "Marketing"],
      avatar: "/placeholder.svg?height=40&width=40&text=SW",
      rating: 4.6,
      hourlyRate: 45,
      status: "Available",
      hiredDate: "2024-01-15",
    },
  ])

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role === "client"
        ? contract?.freelancer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : contract?.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || contract?.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const viewContractDetails = (contract) => {
    setSelectedContract(contract)
    setShowContractDialog(true)
  }

  const handleCreateContract = async () => {
    const isFreelancerHired = hiredFreelancers.some((freelancer) => freelancer.email === createFormData.freelancerEmail)

    if (!isFreelancerHired) {
      alert("You can only create contracts with hired freelancers. Please hire the freelancer first.")
      return
    }

    if (!createFormData.title || !createFormData.freelancerEmail || !createFormData.amount) {
      alert("Please fill in all required fields.")
      return
    }

    setIsCreatingContract(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const selectedFreelancer = hiredFreelancers.find((f) => f.email === createFormData.freelancerEmail)

      const newContract = {
        id: `c${contracts.length + 1}`,
        title: createFormData.title,
        client: {
          name: "Your Company",
          avatar: "/placeholder.svg?height=40&width=40&text=YC",
          rating: 4.8,
          email: "you@company.com",
        },
        freelancer: {
          name: selectedFreelancer?.name || "Selected Freelancer",
          avatar: selectedFreelancer?.avatar || "/placeholder.svg?height=40&width=40&text=SF",
          rating: selectedFreelancer?.rating || 4.9,
          email: createFormData.freelancerEmail,
        },
        contractId: `CT-2024-${String(contracts.length + 1).padStart(3, "0")}`,
        amount: `$${createFormData.amount}`,
        status: "Pending",
        startDate: createFormData.startDate,
        endDate: createFormData.endDate,
        progress: 0,
        paymentType: createFormData.paymentType,
        paymentMethod: "Escrow",
        description: createFormData.description,
        scopeOfWork: createFormData.scopeOfWork.filter((item) => item.trim() !== ""),
        milestones: createFormData.milestones.filter((m) => m.title.trim() !== ""),
        revisionPolicy: createFormData.revisionPolicy,
        confidentiality: createFormData.confidentiality,
        termination: createFormData.termination,
      }

      setContracts([...contracts, newContract])
      setShowCreateDialog(false)

      // Reset form
      setCreateFormData({
        title: "",
        freelancerEmail: "",
        description: "",
        amount: "",
        paymentType: "Fixed",
        paymentMethod: "Escrow",
        startDate: "",
        endDate: "",
        scopeOfWork: [""],
        milestones: [{ title: "", amount: "", deadline: "", description: "" }],
        revisionPolicy: "Up to 3 rounds of revisions included",
        confidentiality: "All project information is confidential",
        termination: "Either party can terminate with 7 days notice",
      })

      console.log("Contract created successfully!")
    } catch (error) {
      console.error("Error creating contract:", error)
      alert("Failed to create contract. Please try again.")
    } finally {
      setIsCreatingContract(false)
    }
  }

  const handleContractStatusUpdate = async (contractId: string, newStatus: string) => {
    setIsUpdatingContract(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setContracts(
        contracts.map((contract) =>
          contract.id === contractId
            ? { ...contract, status: newStatus, progress: newStatus === "Active" ? 10 : contract.progress }
            : contract,
        ),
      )

      console.log(`Contract ${contractId} status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating contract status:", error)
      alert("Failed to update contract status. Please try again.")
    } finally {
      setIsUpdatingContract(false)
    }
  }

  const handleContractAction = (action: string, contractId: string) => {
    console.log(`${action} contract:`, contractId)
    if (action === "message") {
      const contract = contracts.find((c) => c.id === contractId)
      if (contract) {
        const targetUser = role === "client" ? contract.freelancer.name : contract.client.name
        window.location.href = `/${role}/messages?user=${encodeURIComponent(targetUser)}&contract=${contractId}`
      }
    } else if (action === "hire") {
      setShowHireDialog(true)
    } else if (action === "accept") {
      handleContractStatusUpdate(contractId, "Active")
    } else if (action === "reject") {
      handleContractStatusUpdate(contractId, "Rejected")
    }
  }

  const handleHireFreelancer = () => {
    window.location.href = `/client/discover`
  }

  const stats = [
    {
      title: "Total Contracts",
      value: contracts.length,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Contracts",
      value: contracts.filter((c) => c.status === "Active").length,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: role === "client" ? "Total Spent" : "Total Earned",
      value: `$${contracts.reduce((sum, c) => sum + Number.parseInt(c.amount.replace("$", "").replace(",", "")), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Completed",
      value: contracts.filter((c) => c.status === "Completed").length,
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {role === "client" ? "Contract Management" : "My Contracts"}
          </h1>
          <p className="text-gray-400">
            {role === "client"
              ? "Manage your freelancer contracts and track project progress"
              : "Track your client contracts and project deliverables"}
          </p>
        </div>
        {role === "client" && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowHireDialog(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent px-6 py-3 rounded-xl"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Hire Freelancer
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Contract
            </Button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {role === "client" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Hired Freelancers</h3>
                    <p className="text-gray-400 text-sm">Manage your hired freelancers and create contracts</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {hiredFreelancers.length} Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hiredFreelancers.map((freelancer, index) => (
                  <motion.div
                    key={freelancer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={freelancer.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {freelancer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{freelancer.name}</h4>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-400">★</span>
                          <span className="text-white">{freelancer.rating}</span>
                          <span className="text-green-400">${freelancer.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {freelancer.skills.slice(0, 2).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-white/10 text-white border-white/20 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {freelancer.skills.length > 2 && (
                        <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs">
                          +{freelancer.skills.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>Hired: {freelancer.hiredDate}</span>
                      <Badge
                        className={`${freelancer.status === "Available" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"} border text-xs`}
                      >
                        {freelancer.status}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setCreateFormData((prev) => ({ ...prev, freelancerEmail: freelancer.email }))
                          setShowCreateDialog(true)
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <FileSignature className="w-3 h-3 mr-1" />
                        Contract
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContractAction("message", freelancer.id)}
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {hiredFreelancers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No hired freelancers yet</p>
                  <Button
                    onClick={handleHireFreelancer}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Hire Your First Freelancer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-6">
        {filteredContracts.map((contract, index) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={role === "client" ? contract.freelancer.avatar : contract.client.avatar} />
                      <AvatarFallback
                        className={`bg-gradient-to-r ${
                          role === "client" ? "from-blue-500 to-purple-600" : "from-green-500 to-blue-600"
                        } text-white`}
                      >
                        {(role === "client" ? contract.freelancer.name : contract.client.name)
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{contract.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{role === "client" ? contract.freelancer.name : contract.client.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{contract.contractId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {contract.startDate} - {contract.endDate}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">{contract.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 mb-2">{contract.amount}</div>
                    <Badge className={`${getStatusColor(contract.status)} border flex items-center gap-1`}>
                      {getStatusIcon(contract.status)}
                      {contract.status}
                    </Badge>
                  </div>
                </div>

                {contract.status !== "Pending" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white font-semibold">{contract.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${
                          role === "client" ? "from-blue-500 to-purple-600" : "from-green-500 to-blue-600"
                        } h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${contract.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-white/20 text-gray-300">
                      {contract.paymentType}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-gray-300">
                      {contract.paymentMethod}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {/* Role-based action buttons */}
                    {role === "client" && contract.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContractAction("edit", contract.id)}
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Offer
                        </Button>
                        <LoadingButton
                          size="sm"
                          loading={isUpdatingContract}
                          loadingText="Cancelling..."
                          onClick={() => handleContractAction("cancel", contract.id)}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </LoadingButton>
                      </>
                    )}

                    {role === "freelancer" && contract.status === "Pending" && (
                      <>
                        <LoadingButton
                          size="sm"
                          loading={isUpdatingContract}
                          loadingText="Rejecting..."
                          onClick={() => handleContractAction("reject", contract.id)}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </LoadingButton>
                        <LoadingButton
                          size="sm"
                          loading={isUpdatingContract}
                          loadingText="Accepting..."
                          onClick={() => handleContractAction("accept", contract.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </LoadingButton>
                      </>
                    )}

                    <Button
                      size="sm"
                      onClick={() => viewContractDetails(contract)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContractAction("message", contract.id)}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredContracts.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No contracts found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : role === "client"
                  ? "Create your first contract with a hired freelancer"
                  : "You don't have any contracts yet"}
            </p>
            {role === "client" && !searchQuery && statusFilter === "all" && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Contract
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Contract Details Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedContract?.title}</DialogTitle>
                <p className="text-gray-400 mt-1">Contract ID: {selectedContract?.contractId}</p>
              </div>
              <Badge className={`${getStatusColor(selectedContract?.status)} border flex items-center gap-1`}>
                {getStatusIcon(selectedContract?.status)}
                {selectedContract?.status}
              </Badge>
            </div>
          </DialogHeader>

          {selectedContract ? (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
                {[
                  { id: "overview", label: "Overview", icon: FileText },
                  { id: "scope", label: "Scope of Work", icon: Target },
                  { id: "payment", label: "Payment Terms", icon: CreditCard },
                  { id: "timeline", label: "Timeline", icon: Calendar },
                  { id: "terms", label: "Additional Terms", icon: Shield },
                  { id: "activity", label: "Activity Log", icon: Activity },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Contract Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={selectedContract?.client?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {selectedContract?.client?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{selectedContract?.client?.name || "Client"}</p>
                            <p className="text-gray-400 text-sm">Client</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={selectedContract?.freelancer?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                              {selectedContract?.freelancer?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "F"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">
                              {selectedContract?.freelancer?.name || "Freelancer"}
                            </p>
                            <p className="text-gray-400 text-sm">Freelancer</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-white/10">
                          <div>
                            <span className="text-gray-400">Total Amount:</span>
                            <span className="text-green-400 font-semibold ml-2">{selectedContract?.amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Payment Type:</span>
                            <span className="text-white ml-2">{selectedContract?.paymentType}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Start Date:</span>
                            <span className="text-white ml-2">{selectedContract?.startDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">End Date:</span>
                            <span className="text-white ml-2">{selectedContract?.endDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-4">Project Description</h4>
                      <p className="text-gray-300 text-sm leading-relaxed mb-6">{selectedContract?.description}</p>

                      {/* Digital Signatures */}
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                          <FileSignature className="w-4 h-4" />
                          Digital Signatures
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Client:</span>
                            <div className="flex items-center gap-2">
                              {selectedContract?.signatures?.client?.signed ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm">Signed</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-400 text-sm">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Freelancer:</span>
                            <div className="flex items-center gap-2">
                              {selectedContract?.signatures?.freelancer?.signed ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm">Signed</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-400 text-sm">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "scope" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4">Detailed Deliverables</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedContract?.scopeOfWork?.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-semibold mb-4">Client Responsibilities</h4>
                        <div className="space-y-2">
                          {selectedContract?.clientResponsibilities?.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-4">Freelancer Responsibilities</h4>
                        <div className="space-y-2">
                          {selectedContract?.freelancerResponsibilities?.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-2">Total Amount</h5>
                        <p className="text-2xl font-bold text-green-400">{selectedContract?.amount}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-2">Payment Type</h5>
                        <p className="text-white">{selectedContract?.paymentType}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-2">Payment Method</h5>
                        <p className="text-white">{selectedContract?.paymentMethod}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-4">Milestone Breakdown</h4>
                      <div className="space-y-3">
                        {selectedContract?.milestones?.map((milestone) => (
                          <div
                            key={milestone.id}
                            className={`p-4 rounded-lg border ${
                              milestone.completed ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    milestone.completed ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <span className="text-xs">{milestone.id}</span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-white font-medium">{milestone.title}</span>
                                  <p className="text-gray-400 text-sm">{milestone.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-green-400 font-semibold">{milestone.amount}</span>
                                <p className="text-gray-400 text-sm">Due: {milestone.deadline}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="text-white font-semibold mb-4">Project Timeline</h4>
                      <div className="space-y-4">
                        {selectedContract?.milestones?.map((milestone, index) => (
                          <div key={milestone.id} className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  milestone.completed ? "bg-green-500" : "bg-gray-600"
                                }`}
                              />
                              {index < (selectedContract?.milestones?.length || 0) - 1 && (
                                <div className="w-0.5 h-12 bg-gray-600 mt-2" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-white font-medium">{milestone.title}</h5>
                                <span className="text-gray-400 text-sm">{milestone.deadline}</span>
                              </div>
                              <p className="text-gray-400 text-sm mt-1">{milestone.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Overall Progress</span>
                        <span className="text-white font-semibold">{selectedContract?.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${selectedContract?.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "terms" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Revision Policy
                        </h5>
                        <p className="text-gray-300 text-sm">{selectedContract?.additionalTerms?.revisionPolicy}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Confidentiality
                        </h5>
                        <p className="text-gray-300 text-sm">{selectedContract?.additionalTerms?.confidentiality}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Termination
                        </h5>
                        <p className="text-gray-300 text-sm">{selectedContract?.additionalTerms?.termination}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-4">Contract Activity</h4>
                    <div className="space-y-3">
                      {selectedContract?.activityLog?.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">{activity.action}</span>
                              <span className="text-gray-400 text-sm">{activity.timestamp}</span>
                            </div>
                            <p className="text-gray-400 text-sm">by {activity.user}</p>
                            <p className="text-gray-300 text-sm mt-1">{activity.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400">Last updated: {selectedContract?.lastUpdated}</div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download Contract
                  </Button>
                  {/* Role-based action buttons */}
                  {role === "client" && selectedContract?.status === "Active" && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message {role === "client" ? "Freelancer" : "Client"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading contract details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Contract Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Contract</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Freelancer Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Select Freelancer *</label>
              <Select
                value={createFormData.freelancerEmail}
                onValueChange={(value) => setCreateFormData({ ...createFormData, freelancerEmail: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose a hired freelancer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {hiredFreelancers.map((freelancer) => (
                    <SelectItem key={freelancer.id} value={freelancer.email}>
                      <div className="flex items-center gap-2">
                        <span>{freelancer.name}</span>
                        <span className="text-gray-400">({freelancer.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contract Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Contract Title *</label>
              <Input
                placeholder="e.g., Website Redesign"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Project Description</label>
              <textarea
                placeholder="Describe the project scope and requirements..."
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg p-3 min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount and Payment Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Amount (USD) *</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={createFormData.amount}
                  onChange={(e) => setCreateFormData({ ...createFormData, amount: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Payment Type</label>
                <Select
                  value={createFormData.paymentType}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, paymentType: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="Fixed">Fixed Price</SelectItem>
                    <SelectItem value="Hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                <Input
                  type="date"
                  value={createFormData.startDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">End Date</label>
                <Input
                  type="date"
                  value={createFormData.endDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Scope of Work</label>
              <div className="space-y-2">
                {createFormData.scopeOfWork.map((item, index) => (
                  <Input
                    key={index}
                    placeholder={`Deliverable ${index + 1}`}
                    value={item}
                    onChange={(e) => {
                      const newScope = [...createFormData.scopeOfWork]
                      newScope[index] = e.target.value
                      setCreateFormData({ ...createFormData, scopeOfWork: newScope })
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setCreateFormData({ ...createFormData, scopeOfWork: [...createFormData.scopeOfWork, ""] })
                }
                className="mt-2 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Deliverable
              </Button>
            </div>

            {/* Milestones */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Milestones</label>
              <div className="space-y-3">
                {createFormData.milestones.map((milestone, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 space-y-2">
                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => {
                        const newMilestones = [...createFormData.milestones]
                        newMilestones[index].title = e.target.value
                        setCreateFormData({ ...createFormData, milestones: newMilestones })
                      }}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Amount"
                        value={milestone.amount}
                        onChange={(e) => {
                          const newMilestones = [...createFormData.milestones]
                          newMilestones[index].amount = e.target.value
                          setCreateFormData({ ...createFormData, milestones: newMilestones })
                        }}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                      <Input
                        type="date"
                        value={milestone.deadline}
                        onChange={(e) => {
                          const newMilestones = [...createFormData.milestones]
                          newMilestones[index].deadline = e.target.value
                          setCreateFormData({ ...createFormData, milestones: newMilestones })
                        }}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <Input
                        placeholder="Description"
                        value={milestone.description}
                        onChange={(e) => {
                          const newMilestones = [...createFormData.milestones]
                          newMilestones[index].description = e.target.value
                          setCreateFormData({ ...createFormData, milestones: newMilestones })
                        }}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setCreateFormData({
                    ...createFormData,
                    milestones: [
                      ...createFormData.milestones,
                      { title: "", amount: "", deadline: "", description: "" },
                    ],
                  })
                }
                className="mt-2 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {/* Additional Terms */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Revision Policy</label>
                <Input
                  value={createFormData.revisionPolicy}
                  onChange={(e) => setCreateFormData({ ...createFormData, revisionPolicy: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confidentiality</label>
                <Input
                  value={createFormData.confidentiality}
                  onChange={(e) => setCreateFormData({ ...createFormData, confidentiality: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Termination Terms</label>
                <Input
                  value={createFormData.termination}
                  onChange={(e) => setCreateFormData({ ...createFormData, termination: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
              <LoadingButton
                loading={isCreatingContract}
                loadingText="Creating..."
                onClick={handleCreateContract}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Create Contract
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hire Freelancer Dialog */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Hire a Freelancer</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Browse and hire freelancers from our marketplace</p>
            <Button
              onClick={handleHireFreelancer}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              Go to Discover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
