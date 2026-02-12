"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Clock, 
  Target, 
  FileText, 
  Sparkles, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProposalSubmitModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (jobId: string) => void;
  userEmail?: string;
  walletAddress?: string;
}

export function ProposalSubmitModal({
  job,
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  walletAddress
}: ProposalSubmitModalProps) {
  const [text, setText] = useState("");
  const [budget, setBudget] = useState("");
  const [delivery, setDelivery] = useState("");
  const [isSubmitting, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!userEmail) {
      toast({ title: "Error", description: "You must be logged in to submit a proposal", variant: "destructive" });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to apply for projects.",
        variant: "destructive",
      });
      return;
    }

    // 1. Validation
    if (!text || text.trim().length < 50) {
      toast({ title: "Validation Error", description: "Your cover letter should be at least 50 characters to stand out.", variant: "destructive" });
      return;
    }

    const proposedBudget = parseFloat(budget);
    if (isNaN(proposedBudget) || proposedBudget <= 0) {
      toast({ title: "Validation Error", description: "Please provide a valid proposed rate greater than 0.", variant: "destructive" });
      return;
    }

    if (!delivery || delivery.trim().length < 3) {
      toast({ title: "Validation Error", description: "Please provide a realistic delivery estimate.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          email: userEmail,
          coverLetter: text,
          proposedRate: proposedBudget,
          deliveryTime: delivery,
        }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Your proposal has been submitted!" });
        onSuccess(job._id);
        onClose();
        setText("");
        setBudget("");
        setDelivery("");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit proposal");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl shadow-2xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
        
        <DialogHeader className="px-8 pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Proposal Submission</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-white leading-tight">
            Apply for: {job.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            Showcase your expertise and tell the client why you&apos;re the best fit for this project.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 py-6 space-y-8">
          {/* Cover Letter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="coverLetter" className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Cover Letter
              </Label>
              <span className="text-[10px] text-zinc-600 font-medium">{text.length} / 2000 characters</span>
            </div>
            <Textarea
              id="coverLetter"
              placeholder="Describe your approach, relevant experience, and how you can help..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[160px] bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl p-4 focus:ring-blue-500/20 resize-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proposed Rate */}
            <div className="space-y-3">
              <Label htmlFor="rate" className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Your Proposed Rate (ETH)
              </Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl h-14 pl-4 focus:ring-blue-500/20"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs uppercase tracking-widest pointer-events-none">
                  ETH
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 px-1">Clients budget: {job.budget} ETH</p>
            </div>

            {/* Delivery Time */}
            <div className="space-y-3">
              <Label htmlFor="delivery" className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Estimated Delivery
              </Label>
              <Input
                id="delivery"
                placeholder="e.g., 10 days, 2 weeks..."
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl h-14 focus:ring-blue-500/20"
              />
              <p className="text-[10px] text-zinc-500 px-1">Include time for review and revisions</p>
            </div>
          </div>

          {!walletAddress && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-orange-200 font-bold text-xs uppercase tracking-widest mb-1">Wallet Connection Required</h4>
                <p className="text-orange-200/60 text-[11px] leading-relaxed">
                  SmartHire is a Web3 platform. You must connect your wallet to submit proposals and receive payments.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 py-6 bg-zinc-900/30 border-t border-zinc-800/50 gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl px-6 h-12"
          >
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !text || !budget || !delivery}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-8 rounded-xl h-12 transition-all shadow-xl shadow-white/5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
