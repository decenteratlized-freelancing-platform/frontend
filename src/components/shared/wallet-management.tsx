"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Link2, Unlink, ExternalLink, Copy, CheckCircle2, AlertCircle } from "lucide-react"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function WalletManagement() {
    const { address, walletLinkedAt, isConnecting, connectWallet, disconnectWallet } = useWalletConnection()
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)
    const [balance, setBalance] = useState<string | null>(null)
    const [loadingBalance, setLoadingBalance] = useState(false)

    // Fetch wallet balance when connected
    useEffect(() => {
        const fetchBalance = async () => {
            if (!address) {
                setBalance(null)
                return
            }

            setLoadingBalance(true)
            try {
                const provider = (window as any).ethereum
                if (provider) {
                    const balanceHex = await provider.request({
                        method: 'eth_getBalance',
                        params: [address, 'latest']
                    })
                    // Convert from wei to ETH
                    const balanceWei = parseInt(balanceHex, 16)
                    const balanceEth = balanceWei / 1e18
                    setBalance(balanceEth.toFixed(4))
                }
            } catch (error) {
                console.error("Failed to fetch balance:", error)
                setBalance(null)
            } finally {
                setLoadingBalance(false)
            }
        }

        fetchBalance()
    }, [address])

    const handleCopyAddress = async () => {
        if (!address) return
        try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            toast({ title: "Copied!", description: "Wallet address copied to clipboard" })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast({ title: "Copy failed", description: "Could not copy address", variant: "destructive" })
        }
    }

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Unknown"
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-purple-400" />
                            Wallet Settings
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Manage your Ethereum Sepolia wallet for payments
                        </CardDescription>
                    </div>
                    {address && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {address ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Wallet Info Card */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-purple-500/20">
                                        <Wallet className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Connected Wallet</p>
                                        <p className="text-lg font-mono font-semibold text-white">
                                            {formatAddress(address)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopyAddress}
                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    {copied ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                                    <p className="text-lg font-semibold text-white">
                                        {loadingBalance ? (
                                            <span className="text-gray-500">Loading...</span>
                                        ) : balance !== null ? (
                                            `${balance} ETH`
                                        ) : (
                                            <span className="text-gray-500">—</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Network</p>
                                    <p className="text-lg font-semibold text-white">Sepolia Testnet</p>
                                </div>
                            </div>

                            {walletLinkedAt && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-gray-500">
                                        Linked on {formatDate(walletLinkedAt)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                                onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View on Etherscan
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={disconnectWallet}
                            >
                                <Unlink className="w-4 h-4 mr-2" />
                                Disconnect Wallet
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl"
                    >
                        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Connect your MetaMask wallet to receive payments in ETH on the Sepolia testnet
                        </p>
                        <Button
                            onClick={connectWallet}
                            disabled={isConnecting}
                            className="bg-white hover:bg-zinc-200 text-zinc-950 px-8 font-bold"
                        >
                            {isConnecting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Connect MetaMask
                                </>
                            )}
                        </Button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>Make sure MetaMask is installed and set to Sepolia network</span>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
