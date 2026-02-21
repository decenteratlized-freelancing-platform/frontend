"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Access Denied: Invalid Credentials")
                setIsLoading(false)
                return
            }

            localStorage.setItem("adminToken", data.token)
            localStorage.setItem("adminEmail", data.admin.email)
            router.push("/admin/dashboard")
        } catch (err) {
            setError("Security Handshake Failed: Server unreachable")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Structural Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/50" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-5 py-2.5 rounded-full"
                    >
                        <Image
                            src="/logo-w-removebg-preview.png"
                            alt="SmartHire"
                            width={24}
                            height={24}
                            className="grayscale brightness-200"
                        />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Security Gateway</span>
                    </motion.div>
                </div>

                <Card className="bg-zinc-900 border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="space-y-1 pt-10 px-10 pb-2">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-900/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-black text-white tracking-tight">Admin Portal</CardTitle>
                        <p className="text-zinc-500 text-sm font-medium">Elevated privileges required for access</p>
                    </CardHeader>

                    <CardContent className="p-10 pt-6">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <span className="text-xs font-bold text-red-500 uppercase tracking-wide leading-tight">{error}</span>
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Work Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@smarthire.app"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 pl-12 bg-zinc-950 border-zinc-800 text-white rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Security Key</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-14 pl-12 bg-zinc-950 border-zinc-800 text-white rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] group disabled:opacity-50 disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="uppercase tracking-[0.2em] text-xs">Authenticating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 w-full">
                                        <span className="uppercase tracking-[0.2em] text-xs">Initiate Secure Login</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-8">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">© 2026 SmartHire Inc.</span>
                            <div className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Systems Active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <p className="text-center mt-8 text-zinc-600 text-xs font-medium">
                    Authorized personnel only. All access attempts are logged and monitored.
                </p>
            </motion.div>
        </div>
    )
}
