"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { CreditCard, Plus, Trash2, Smartphone, Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

type PaymentMethod = {
    id: string
    type: "bank" | "upi"
    title: string
    subtitle: string
    isDefault: boolean
    icon: any
}

export default function PaymentMethods() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("bank")

    // Form states
    const [bankForm, setBankForm] = useState({ accountNo: "", ifsc: "", holderName: "" })
    const [upiId, setUpiId] = useState("")

    useEffect(() => {
        fetchMethods()
    }, [session])

    const fetchMethods = async () => {
        // No token needed, session cookie handles it
        try {
            const res = await fetch("/api/user/payment-methods")
            if (!res.ok) return

            const data = await res.json()
            if (data.bankAccount) {
                const loadedMethods: PaymentMethod[] = []

                if (data.bankAccount.accountNo) {
                    loadedMethods.push({
                        id: "bank",
                        type: "bank",
                        title: data.bankAccount.holderName || "Bank Account",
                        subtitle: `${data.bankAccount.accountNo} (${data.bankAccount.ifsc})`,
                        isDefault: data.paymentMode === "bank",
                        icon: Landmark
                    })
                }

                if (data.bankAccount.upiId) {
                    loadedMethods.push({
                        id: "upi",
                        type: "upi",
                        title: data.bankAccount.upiId,
                        subtitle: "Unified Payments Interface",
                        isDefault: data.paymentMode === "upi", // assuming 'upi' mode exists or we just show list
                        icon: Smartphone
                    })
                }

                setMethods(loadedMethods)
            }
        } catch (error) {
            console.error("Failed to fetch payment methods", error)
        }
    }

    const handleAddMethod = async () => {
        setLoading(true)
        try {
            let payloadBank: any = {};
            let methodType = "";

            // We now rely on the backend's dot notation update to only touch the fields we send.
            // No need to fetch existing data first.

            if (activeTab === "bank") {
                payloadBank.accountNo = bankForm.accountNo;
                payloadBank.ifsc = bankForm.ifsc;
                payloadBank.holderName = bankForm.holderName;
                methodType = "Bank Account";
            } else if (activeTab === "upi") {
                payloadBank.upiId = upiId;
                methodType = "UPI ID";
            }

            const response = await fetch("/api/user/payment-methods", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bankAccount: payloadBank,
                    paymentMode: activeTab === "upi" ? "upi" : "bank" // Optionally update mode too
                }),
            })

            if (response.ok) {
                toast({ title: "Success", description: `${methodType} added successfully` })
                setIsAddModalOpen(false)
                fetchMethods() // Refresh UI to show the new state (merged by backend)

                // Clear active forms
                if (activeTab === "bank") {
                    setBankForm({ accountNo: "", ifsc: "", holderName: "" })
                } else {
                    setUpiId("")
                }
            } else {
                throw new Error("Failed to save")
            }

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to add payment method", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (id: string, type: string) => {
        try {
            // Send null to clear specific fields
            let payloadBank: any = {};

            if (type === "bank") {
                payloadBank.accountNo = null;
                payloadBank.ifsc = null;
                payloadBank.holderName = null;
            } else if (type === "upi") {
                payloadBank.upiId = null;
            }

            const response = await fetch("/api/user/payment-methods", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bankAccount: payloadBank
                }),
            })

            if (response.ok) {
                toast({ title: "Removed", description: "Payment method removed" })
                fetchMethods()
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to remove", variant: "destructive" })
        }
    }

    return (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold text-white">Payment Details</CardTitle>
                    <CardDescription className="text-gray-400">Manage your bank details for payouts</CardDescription>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-gray-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Details
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Payment Details</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Enter your bank or UPI details.
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                                <TabsTrigger value="bank">Bank Account</TabsTrigger>
                                <TabsTrigger value="upi">UPI</TabsTrigger>
                            </TabsList>

                            <div className="mt-6 space-y-4">
                                <TabsContent value="bank" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="holderName">Account Holder Name</Label>
                                        <Input
                                            id="holderName"
                                            placeholder="John Doe"
                                            className="bg-gray-800 border-gray-700 text-white"
                                            value={bankForm.holderName}
                                            onChange={e => setBankForm({ ...bankForm, holderName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNo">Account Number</Label>
                                        <Input
                                            id="accountNo"
                                            placeholder="1234567890"
                                            className="bg-gray-800 border-gray-700 text-white"
                                            value={bankForm.accountNo}
                                            onChange={e => setBankForm({ ...bankForm, accountNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ifsc">IFSC Code</Label>
                                        <Input
                                            id="ifsc"
                                            placeholder="SBIN0001234"
                                            className="bg-gray-800 border-gray-700 text-white"
                                            value={bankForm.ifsc}
                                            onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value })}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="upi" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="upiId">UPI ID</Label>
                                        <Input
                                            id="upiId"
                                            placeholder="username@upi"
                                            className="bg-gray-800 border-gray-700 text-white"
                                            value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                        />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                                Cancel
                            </Button>
                            <Button onClick={handleAddMethod} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {loading ? "Saving..." : "Save Details"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                <AnimatePresence>
                    {methods.map((method) => (
                        <motion.div
                            key={method.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`relative p-4 rounded-xl border transition-all duration-200 bg-white/5 border-white/10 hover:border-white/20`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg bg-gray-700/50 text-gray-400`}>
                                        <method.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white">{method.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-400">{method.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemove(method.id, method.type)}
                                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {methods.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                        <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No payment details</h3>
                        <p className="text-gray-400 mt-1">Add your bank or UPI details to receive payments</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
