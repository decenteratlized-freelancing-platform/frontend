"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/shared/loading-button"
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
FileText,
Plus,
Search,
Calendar,
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
Loader2,
} from "lucide-react"

interface ContractProps {
  userRole: "client" | "freelancer"
}

const getStatusColor = (status?: string) => {
    const s = (status ?? "").toString().toLowerCase()
    switch (s) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "pending":
      case "created":
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
      case "created":
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

const getCurrencyFromPaymentType = (paymentType: string): 'ETH' | 'INR' => {
  return paymentType === 'crypto' ? 'ETH' : 'INR';
};

const formatNatively = (amount: number, currency: 'INR' | 'ETH') => {
    if (currency === 'ETH') {
      return `${amount.toFixed(4)} ETH`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};

export default function UnifiedContract({ userRole }: ContractProps) {
  const role = userRole || "client";
  const currentUser = useCurrentUser();

  const [contracts, setContracts] = useState<any[]>([]);
  const [hirableProposals, setHirableProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    proposalId: null as string | null,
    title: "",
    description: "",
    milestones: [{ description: "", amount: "" }],
    totalAmount: "0",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const contractsRes = await fetch('http://localhost:5000/api/contracts');
        const contractsData = await contractsRes.json();
        if (contractsRes.ok) {
          setContracts(contractsData);
        } else {
          throw new Error(contractsData.error || "Failed to fetch contracts");
        }

        if (role === 'client' && currentUser?.email) {
          const hirableRes = await fetch(`http://localhost:5000/api/proposals/hirable?clientEmail=${currentUser.email}`);
          const hirableData = await hirableRes.json();
          if (hirableRes.ok) {
            setHirableProposals(hirableData);
          } else {
            throw new Error(hirableData.error || "Failed to fetch hirable proposals");
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
        fetchData();
    }
  }, [role, currentUser]);
  
  const handleOpenCreateDialog = (proposal: any) => {
    setCreateFormData({
        proposalId: proposal._id,
        title: proposal.job.title,
        description: '',
        milestones: [{ description: "", amount: "" }],
        totalAmount: proposal.proposedRate.toString(),
    });
    setShowCreateDialog(true);
  };

  const handleCreateContract = async () => {
    const validMilestones = createFormData.milestones.filter(
        (m) => m.description.trim() !== "" && m.amount.trim() !== ""
      );
  
      if (!createFormData.proposalId) {
        alert("Proposal ID is missing.");
        return;
      }
      if (validMilestones.length === 0) {
        alert("Please define at least one valid milestone.");
        return;
      }

      const sumMilestoneAmounts = validMilestones.reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0);
      const parsedTotalAmount = parseFloat(createFormData.totalAmount || '0');

      if (sumMilestoneAmounts !== parsedTotalAmount) {
          alert("The sum of milestone amounts must match the total amount.");
          return;
      }

      setIsCreatingContract(true);
      try {
        const response = await fetch("http://localhost:5000/api/contracts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                proposalId: createFormData.proposalId,
                milestones: validMilestones,
                totalAmount: createFormData.totalAmount,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create contract");
        }
        const result = await response.json();
        setContracts(prev => [result.contract, ...prev]);
        setHirableProposals(prev => prev.filter(p => p._id !== createFormData.proposalId));
        setShowCreateDialog(false);
      } catch (error: any) {
        console.error("Error creating contract:", error);
        alert(`Failed to create contract: ${error.message}`);
      } finally {
        setIsCreatingContract(false);
      }
  };

  const filteredContracts = contracts.filter((contract: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      contract?.job?.title?.toLowerCase().includes(searchLower) ||
      contract?.freelancer?.fullName?.toLowerCase().includes(searchLower) ||
      contract?.client?.fullName?.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || contract?.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });
  
  const viewContractDetails = (contract: any) => {
    setSelectedContract(contract);
    setShowContractDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-white text-xl">Loading Contracts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Contracts</h1>
        
        {role === 'client' && hirableProposals.length > 0 && (
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Ready to Contract</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hirableProposals.map((proposal) => (
                        <Card key={proposal._id} className="bg-white/5 border-white/10">
                            <CardContent className="p-4 flex flex-col">
                                <h4 className="text-white font-semibold">{proposal.freelancer.fullName}</h4>
                                <p className="text-gray-400 text-sm flex-grow">{proposal.job.title}</p>
                                <Button size="sm" className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenCreateDialog(proposal)}>
                                    <FileSignature className="w-4 h-4 mr-2" />
                                    Create Contract
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}
        
        <h2 className="text-2xl font-semibold text-white mb-4">Existing Contracts</h2>
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
            {filteredContracts.map((contract) => (
                <Card key={contract._id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{contract.job?.title || 'Job Title Missing'}</h3>
                                <p className="text-sm text-gray-400">
                                    {role === 'client' ? `Freelancer: ${contract.freelancer?.fullName}` : `Client: ${contract.client?.fullName}`}
                                </p>
                            </div>
                            <Badge className={`${getStatusColor(contract.status)}`}>{contract.status}</Badge>
                        </div>
                        <div className="mt-4">
                            <p className="text-white font-semibold text-lg">{formatNatively(parseFloat(contract.totalAmount), getCurrencyFromPaymentType(contract.paymentType))}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button size="sm" onClick={() => viewContractDetails(contract)}>View Details</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {filteredContracts.length === 0 && (
                <div className="text-center py-12 text-white">No contracts found.</div>
            )}
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader><DialogTitle>Create Contract: {createFormData.title}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <Input value={createFormData.description} onChange={e => setCreateFormData(p => ({...p, description: e.target.value}))} className="bg-white/10" placeholder="Description" />
                    <div>
                        {createFormData.milestones.map((milestone, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <Input placeholder="Description" value={milestone.description} onChange={e => {
                                    const newM = [...createFormData.milestones]; newM[index].description = e.target.value; setCreateFormData(p => ({...p, milestones: newM}));
                                }} className="bg-white/10"/>
                                <Input placeholder="Amount" value={milestone.amount} onChange={e => {
                                    const newM = [...createFormData.milestones]; newM[index].amount = e.target.value; setCreateFormData(p => ({...p, milestones: newM}));
                                }} className="bg-white/10"/>
                            </div>
                        ))}
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => setCreateFormData(p => ({...p, milestones: [...p.milestones, {description: "", amount: ""}]}))}>
                            <Plus className="w-4 h-4 mr-2"/> Add Milestone
                        </Button>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Total Amount</label>
                        <Input type="number" value={createFormData.totalAmount} onChange={e => setCreateFormData(p => ({...p, totalAmount: e.target.value}))} className="bg-white/10"/>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                        <LoadingButton loading={isCreatingContract} onClick={handleCreateContract}>Create</LoadingButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold">{selectedContract?.job?.title || 'Contract Details'}</DialogTitle>
                            <p className="text-gray-400 mt-1">Contract ID: {selectedContract?.contractId}</p>
                        </div>
                        <Badge className={`${getStatusColor(selectedContract?.status)} border flex items-center gap-1`}>
                            {getStatusIcon(selectedContract?.status)}
                            {selectedContract?.status}
                        </Badge>
                    </div>
                </DialogHeader>
                {selectedContract && (
                    <div className="space-y-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-white font-semibold mb-4">Summary</h4>
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Client:</span> {selectedContract.client.fullName}</p>
                                    <p><span className="font-semibold">Freelancer:</span> {selectedContract.freelancer.fullName}</p>
                                    <p><span className="font-semibold">Total Amount:</span> {formatNatively(parseFloat(selectedContract.totalAmount), getCurrencyFromPaymentType(selectedContract.paymentType))}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-4">Milestones</h4>
                                {(selectedContract.milestones || []).map((milestone: any) => (
                                    <div key={milestone._id} className="mb-2">
                                        <p>{milestone.description} - {formatNatively(parseFloat(milestone.amount), getCurrencyFromPaymentType(selectedContract.paymentType))}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}