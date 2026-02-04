"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  FileText,
  Search,
  Loader2,
  Plus,
  FileSignature,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContractDetailView } from "./contract-detail-view";
import { ContractCard } from "./contract-card";
import { HirableProposalCard } from "./hirable-proposal-card";
import { LoadingButton } from "./loading-button";
import { formatCurrency } from "@/lib/utils";

const fetchData = async (userRole: string, userEmail: string | undefined) => {
  // Build URL with appropriate email filter based on role
  let contractsUrl = 'http://localhost:5000/api/contracts';
  if (userEmail) {
    if (userRole === 'client') {
      contractsUrl += `?clientEmail=${encodeURIComponent(userEmail)}`;
    } else if (userRole === 'freelancer') {
      contractsUrl += `?freelancerEmail=${encodeURIComponent(userEmail)}`;
    }
  }

  const contractsRes = await fetch(contractsUrl);
  const contractsData = await contractsRes.json();
  if (!contractsRes.ok) throw new Error(contractsData.error || "Failed to fetch contracts");

  let hirableProposalsData = [];
  if (userRole === 'client' && userEmail) {
    const hirableRes = await fetch(`http://localhost:5000/api/proposals/hirable?clientEmail=${userEmail}`);
    const hirableData = await hirableRes.json();
    if (hirableRes.ok) { // Only assign if fetch was successful
      hirableProposalsData = hirableData;
    } else {
      console.error("Failed to fetch hirable proposals:", hirableData.error);
    }
  }

  return { contracts: contractsData, hirableProposals: hirableProposalsData };
};

const CreateContractDialog = ({ isOpen, onOpenChange, proposal, onContractCreated }: any) => {
  const [isCreating, setIsCreating] = useState(false);
  const [milestones, setMilestones] = useState([{ description: "", amount: "" }]);
  const totalAmount = useMemo(() => {
    return milestones.reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0);
  }, [milestones]);

  useEffect(() => {
    if (proposal) {
      setMilestones([{ description: "Initial milestone", amount: proposal.proposedRate.toString() }])
    }
  }, [proposal]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: "", amount: "" }]);
  };

  const handleCreate = async () => {
    const validMilestones = milestones.filter(m => m.description.trim() && m.amount.trim());
    if (!proposal?._id || validMilestones.length === 0) {
      alert("Please define at least one valid milestone.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("http://localhost:5000/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal._id,
          milestones: validMilestones,
          totalAmount: totalAmount,
          paymentType: proposal.paymentType,
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Failed to create contract");

      const result = await response.json();
      onContractCreated(result.contract);
    } catch (error: any) {
      alert(`Failed to create contract: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!proposal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Create Contract</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Finalize the terms for your project with <span className="font-semibold text-zinc-200">{proposal.freelancer.fullName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-8 py-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Milestones</h3>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={handleAddMilestone}
              >
                <Plus className="w-3.5 h-3.5 mr-2" /> Add Milestone
              </Button>
            </div>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={`Milestone ${index + 1} description`}
                      value={milestone.description}
                      onChange={e => {
                        const newM = [...milestones]; newM[index].description = e.target.value; setMilestones(newM);
                      }}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-blue-500/20 h-12"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={milestone.amount}
                      onChange={e => {
                        const newM = [...milestones]; newM[index].amount = e.target.value; setMilestones(newM);
                      }}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-blue-500/20 h-12"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Value</p>
              <p className="text-zinc-400 text-xs mt-1">Sum of all milestones</p>
            </div>
            <span className="text-2xl font-bold text-white">{formatCurrency(totalAmount, proposal.job?.paymentCurrency === 'INR' ? 'INR' : 'ETH')}</span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">Cancel</Button>
          <LoadingButton loading={isCreating} onClick={handleCreate} className="px-8 py-2.5 text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200">Create Contract</LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function UnifiedContractV2({ userRole }: { userRole: "client" | "freelancer" }) {
  const currentUser = useCurrentUser();
  const [contracts, setContracts] = useState<any[]>([]);
  const [hirableProposals, setHirableProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [proposalToHire, setProposalToHire] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      fetchData(userRole, currentUser.email)
        .then(data => {
          setContracts(data.contracts);
          setHirableProposals(data.hirableProposals);
        })
        .catch(err => {
          console.error("Failed to fetch data:", err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [userRole, currentUser]);

  const handleOpenCreateDialog = (proposal: any) => {
    setProposalToHire(proposal);
    setShowCreateDialog(true);
  };

  const handleContractCreated = (newContract: any) => {
    setContracts(prev => [newContract, ...prev]);
    setHirableProposals(prev => prev.filter(p => p._id !== proposalToHire?._id));
    setShowCreateDialog(false);
    setProposalToHire(null);
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract: any) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        contract?.job?.title?.toLowerCase().includes(searchLower) ||
        contract?.freelancer?.fullName?.toLowerCase().includes(searchLower) ||
        contract?.client?.fullName?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "all" || contract?.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-white text-xl">Loading Contracts...</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex w-full h-screen items-center justify-center bg-black text-red-400">{error}</div>;
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <CreateContractDialog
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        proposal={proposalToHire}
        onContractCreated={handleContractCreated}
      />
      <AnimatePresence mode="wait">
        {selectedContract ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ContractDetailView
              contract={selectedContract}
              userRole={userRole}
              userId={currentUser?._id || ""}
              onBack={() => setSelectedContract(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <header className="mb-12">
              <div className="flex justify-between items-center">
                <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-6 py-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-medium text-white">Contract Management</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mt-6">Your Contracts</h1>
              <p className="mt-4 max-w-2xl text-lg text-neutral-400">
                Oversee all your active, pending, and completed project agreements in one place.
              </p>
            </header>

            {userRole === 'client' && hirableProposals.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3"><FileSignature className="text-green-400" /> Ready to Hire</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hirableProposals.map(proposal => (
                    <HirableProposalCard
                      key={proposal._id}
                      proposal={proposal}
                      onHire={() => handleOpenCreateDialog(proposal)}
                    />
                  ))}
                </div>
              </section>
            )}

            <main>
              <h2 className="text-3xl font-bold text-white mb-6">Existing Contracts</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by title, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 h-14 text-lg rounded-xl bg-white/5 border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-56 h-14 py-3 text-lg rounded-xl bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredContracts.map((contract) => (
                  <ContractCard
                    key={contract._id}
                    contract={contract}
                    userRole={userRole}
                    onClick={() => setSelectedContract(contract)}
                  />
                ))}
              </div>
              {filteredContracts.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <FileText className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-2 text-xl font-semibold text-white">No contracts found</h3>
                  <p className="mt-1 text-base text-gray-400">
                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Your active contracts will appear here.'}
                  </p>
                </div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}