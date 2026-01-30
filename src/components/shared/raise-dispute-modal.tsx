"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Upload, X } from "lucide-react"

interface RaiseDisputeModalProps {
    isOpen: boolean
    onClose: () => void
    contractId: string
    userId: string
    userRole: "client" | "freelancer"
    againstUserId: string
    onSuccess: () => void
}

const DISPUTE_REASONS = [
    { value: "payment_not_released", label: "Payment Not Released" },
    { value: "quality_issues", label: "Quality Issues" },
    { value: "scope_disagreement", label: "Scope Disagreement" },
    { value: "non_delivery", label: "Non-Delivery" },
    { value: "communication_issues", label: "Communication Issues" },
    { value: "contract_violation", label: "Contract Violation" },
    { value: "fraud", label: "Suspected Fraud" },
    { value: "other", label: "Other" },
]

export default function RaiseDisputeModal({
    isOpen,
    onClose,
    contractId,
    userId,
    userRole,
    againstUserId,
    onSuccess,
}: RaiseDisputeModalProps) {
    const [reason, setReason] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (!reason || !description.trim()) {
            setError("Please fill in all fields")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("http://localhost:5000/api/disputes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contractId,
                    raisedBy: userId,
                    raisedByRole: userRole,
                    againstUser: againstUserId,
                    reason,
                    description,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to submit dispute")
                return
            }

            onSuccess()
            onClose()
            setReason("")
            setDescription("")
        } catch (err) {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Raise a Dispute
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-400">
                            ⚠️ Disputes are reviewed by our admin team. Please provide accurate information and evidence.
                        </p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Reason for Dispute</label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10">
                                {DISPUTE_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Describe the Issue</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explain what happened and why you're raising this dispute..."
                            className="bg-white/5 border-white/10 text-white min-h-[120px]"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button onClick={onClose} variant="outline" className="flex-1 border-white/10 text-white">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !reason || !description.trim()}
                            className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                            {loading ? "Submitting..." : "Submit Dispute"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
