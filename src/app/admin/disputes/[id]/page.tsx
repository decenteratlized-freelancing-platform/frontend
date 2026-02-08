"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Send, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User,
  MessageSquare,
  Clock,
  Paperclip,
  Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function DisputeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolution State
  const [resolutionType, setResolutionType] = useState("");
  const [resolutionAmount, setResolutionAmount] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [processingResolution, setProcessingResolution] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [dispute?.messages]);

  const fetchDispute = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch dispute");
      const data = await res.json();
      setDispute(data);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Could not load dispute details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes/${id}/message`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: message }),
      });

      if (res.ok) {
        setMessage("");
        fetchDispute(); // Refresh to show new message
      } else {
        toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    setProcessingResolution(true);
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/disputes/${id}/resolve`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                resolution: resolutionType,
                amount: resolutionAmount,
                notes: resolutionNotes
            }),
        });

        if (res.ok) {
            toast({ title: "Success", description: "Dispute resolved successfully" });
            fetchDispute();
        } else {
            const err = await res.json();
            toast({ title: "Error", description: err.error || "Failed to resolve dispute", variant: "destructive" });
        }
    } catch (error) {
        console.error("Resolution error:", error);
        toast({ title: "Error", description: "Failed to resolve dispute", variant: "destructive" });
    } finally {
        setProcessingResolution(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!dispute) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-zinc-900 text-zinc-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Disputes
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Dispute Info & Evidence */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            Dispute Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                            <div className="mt-1">
                                <Badge variant="outline" className={`
                                    ${dispute.status === 'open' ? 'text-blue-400 border-blue-400 bg-blue-400/10' : ''}
                                    ${dispute.status === 'resolved' ? 'text-green-400 border-green-400 bg-green-400/10' : ''}
                                    ${dispute.status === 'under_review' ? 'text-yellow-400 border-yellow-400 bg-yellow-400/10' : ''}
                                `}>
                                    {dispute.status.replace("_", " ")}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Dispute ID</span>
                            <p className="text-sm font-mono text-zinc-300 mt-1">{dispute.disputeId}</p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reason</span>
                            <p className="text-sm text-zinc-300 mt-1 capitalize">{dispute.reason.replace("_", " ")}</p>
                        </div>
                        
                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</span>
                            <p className="text-sm text-zinc-300 mt-1 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                                {dispute.description}
                            </p>
                        </div>

                        <Separator className="bg-zinc-800" />

                        <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Parties Involved</span>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-zinc-950/30 p-2 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-zinc-300">Raised By</p>
                                        <p className="text-xs text-zinc-500 truncate">{dispute.raisedBy?.email}</p>
                                        <Badge variant="secondary" className="text-[10px] mt-1">{dispute.raisedByRole}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-zinc-950/30 p-2 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-zinc-300">Against</p>
                                        <p className="text-xs text-zinc-500 truncate">{dispute.againstUser?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <Paperclip className="w-5 h-5 text-zinc-400" />
                            Evidence
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dispute.evidence && dispute.evidence.length > 0 ? (
                            <div className="space-y-3">
                                {dispute.evidence.map((ev: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800">
                                        <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="overflow-hidden">
                                            <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-400 hover:underline truncate block">
                                                View Evidence #{idx + 1}
                                            </a>
                                            <p className="text-xs text-zinc-500 mt-1">{ev.description || "No description"}</p>
                                            <p className="text-[10px] text-zinc-600 mt-1">
                                                Submitted by {ev.submittedBy === dispute.raisedBy._id ? "Plaintiff" : "Defendant"} • {new Date(ev.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 italic">No evidence submitted yet.</p>
                        )}
                    </CardContent>
                </Card>

                {dispute.status !== 'resolved' && (
                    <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-purple-500" />
                                Admin Action
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                                        Resolve Dispute
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Resolve Dispute</DialogTitle>
                                        <DialogDescription>
                                            Make a final decision. This action will release funds and cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Resolution Type</label>
                                            <Select onValueChange={setResolutionType} value={resolutionType}>
                                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                                    <SelectValue placeholder="Select outcome" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                    <SelectItem value="refund_full">Full Refund to Client</SelectItem>
                                                    <SelectItem value="release_payment">Release Full Payment to Freelancer</SelectItem>
                                                    <SelectItem value="split">Split Funds (Partial Refund)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {resolutionType === 'split' && (
                                             <div className="space-y-2">
                                                <label className="text-sm font-medium">Refund Amount to Client (ETH)</label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0.00" 
                                                    value={resolutionAmount}
                                                    onChange={(e) => setResolutionAmount(e.target.value)}
                                                    className="bg-zinc-800 border-zinc-700 text-white" 
                                                />
                                                <p className="text-xs text-zinc-500">Remaining amount goes to freelancer.</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Final Decision Notes</label>
                                            <Textarea 
                                                placeholder="Explain the reason for this decision..." 
                                                value={resolutionNotes}
                                                onChange={(e) => setResolutionNotes(e.target.value)}
                                                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]" 
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button 
                                            onClick={handleResolve} 
                                            disabled={!resolutionType || !resolutionNotes || processingResolution}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            {processingResolution ? "Processing..." : "Confirm Resolution"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column: Mediation Chat */}
            <div className="lg:col-span-2 h-[calc(100vh-8rem)] flex flex-col">
                <Card className="flex-1 flex flex-col bg-zinc-900 border-zinc-800 overflow-hidden">
                    <CardHeader className="border-b border-zinc-800 py-4">
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            Mediation Room
                        </CardTitle>
                        <p className="text-xs text-zinc-500">
                            Visible to Admin, Client, and Freelancer. Use this for official communication.
                        </p>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {dispute.messages && dispute.messages.map((msg: any, idx: number) => {
                                    const isAdmin = msg.senderRole === 'admin';
                                    return (
                                        <div key={idx} className={`flex ${isAdmin ? 'justify-center' : (msg.senderRole === dispute.raisedByRole ? 'justify-end' : 'justify-start')}`}>
                                            <div className={`
                                                max-w-[80%] rounded-xl p-4
                                                ${isAdmin 
                                                    ? 'bg-zinc-800/50 border border-zinc-700 text-center text-sm w-full mx-8 italic text-zinc-400' 
                                                    : (msg.senderRole === dispute.raisedByRole 
                                                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none' 
                                                        : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-none')
                                                }
                                            `}>
                                                {!isAdmin && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                            {msg.sender?.fullName || "Unknown User"}
                                                        </span>
                                                        <Badge variant="secondary" className="text-[9px] h-4 px-1">{msg.senderRole}</Badge>
                                                    </div>
                                                )}
                                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                                <div className={`text-[10px] mt-2 opacity-50 flex items-center gap-1 ${isAdmin ? 'justify-center' : 'justify-end'}`}>
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(msg.sentAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            {dispute.status !== 'resolved' && dispute.status !== 'closed' ? (
                                <div className="flex gap-3">
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message to both parties..."
                                        className="min-h-[50px] max-h-[150px] bg-zinc-900 border-zinc-700 text-white focus:ring-blue-500/20 resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <Button 
                                        onClick={handleSendMessage} 
                                        disabled={!message.trim() || sending}
                                        className="h-auto px-6 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-500 text-sm">
                                    This dispute has been resolved. No further messages can be sent.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
