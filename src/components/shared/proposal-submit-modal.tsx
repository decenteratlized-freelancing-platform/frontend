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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Clock, 
  Coins, 
  FileText, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Wallet
} from "lucide-react";
import { CurrencyLogo } from "./currency-logo";

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
  walletAddress,
}: ProposalSubmitModalProps) {
  const [rate, setRate] = useState("");
  const [text, setText] = useState("");
  const [delivery, setDelivery] = useState("");
  const [isSubmitting, setIsProcessing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();

  const generateAICoverLetter = async () => {
    if (!userEmail) return;
    setIsGeneratingAI(true);
    try {
      // Fetch freelancer context
      const profRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings?email=${userEmail}`);
      const profData = await profRes.json();
      const freelancer = profData.profile || {};

      const prompt = `Generate a professional, persuasive cover letter for a freelancer applying to a job.
      
      Freelancer Details:
      Name: ${freelancer.fullName}
      Skills: ${freelancer.skills?.join(", ")}
      Bio: ${freelancer.professionalBio}
      
      Job Details:
      Title: ${job.title}
      Description: ${job.description}
      Category: ${job.category}
      
      Client Details:
      Name: ${job.client?.fullName || "the client"}
      
      Rules:
      1. Be concise (max 250 words).
      2. Highlight relevant skills from the freelancer's profile that match the job.
      3. Address the specific requirements mentioned in the job description.
      4. Maintain a confident yet professional tone.
      5. Do not use placeholders like [Date] or [Company Name] unless known.
      6. Focus on how the freelancer can provide value.`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: prompt,
            context: { type: "proposal_generation", jobTitle: job.title }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setText(data.text);
        toast({ title: "AI Generated", description: "Your cover letter has been crafted by SmartHire AI." });
      } else {
        throw new Error("Failed to generate AI response");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "AI Error", description: "Failed to generate cover letter. Please try writing manually.", variant: "destructive" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!rate || !text || !delivery) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!walletAddress) {
        toast({
            title: "Wallet Required",
            description: "You must link a crypto wallet to your profile before applying. Please go to Settings to link your wallet.",
            variant: "destructive"
        });
        return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/proposals/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          freelancerEmail: userEmail,
          proposedRate: parseFloat(rate),
          deliveryTime: delivery,
          coverLetter: text,
        }),
      });

      if (res.ok) {
        toast({
          title: "Proposal Sent!",
          description: "Your application has been delivered to the client.",
        });
        onSuccess(job._id);
        onClose();
        // Reset form
        setRate("");
        setText("");
        setDelivery("");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit proposal");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl p-0 overflow-hidden rounded-[2rem]">
        <div className="bg-blue-600/10 px-8 py-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              Submit Proposal
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-1">
              Applying for: <span className="text-blue-400 font-semibold">{job.title}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Budget Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Client Budget</p>
              <div className="flex items-center gap-2">
                <CurrencyLogo currency={job.paymentCurrency || "ETH"} size={16} />
                <span className="text-lg font-bold text-white">{job.budget} {job.paymentCurrency || "ETH"}</span>
              </div>
            </div>
            {!walletAddress && (
                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-[10px] font-bold text-red-400 uppercase leading-tight">No Wallet Linked. Update your settings.</p>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rate Input */}
            <div className="space-y-3">
              <Label htmlFor="rate" className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Coins className="w-3.5 h-3.5" /> Proposed Rate ({job.paymentCurrency || "ETH"})
              </Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  placeholder="0.00"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white pl-4 h-12 rounded-xl focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Delivery Time */}
            <div className="space-y-3">
              <Label htmlFor="delivery" className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Estimated Delivery
              </Label>
              <Input
                id="delivery"
                placeholder="e.g. 5 days, 2 weeks"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="coverLetter" className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Cover Letter
              </Label>
              <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateAICoverLetter}
                    disabled={isGeneratingAI}
                    className="h-7 bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                >
                    {isGeneratingAI ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                    Generate with AI
                </Button>
                <span className="text-[10px] text-zinc-600 font-medium">{text.length} / 2000 characters</span>
              </div>
            </div>
            <Textarea
              id="coverLetter"
              placeholder="Explain why you're the best fit for this project..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white min-h-[200px] rounded-2xl focus:ring-blue-500/50 transition-all leading-relaxed p-4"
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter className="p-8 bg-zinc-900/30 border-t border-white/5 gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !walletAddress}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-black uppercase tracking-widest px-8 h-12 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
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
