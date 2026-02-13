"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, CheckCircle2, Shield } from "lucide-react";

function VerifyOTPContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // 🚀 OTP Bypass: Redirect to login as this page is no longer used
    useEffect(() => {
        router.replace("/login");
    }, [router]);

    const email = searchParams.get("email") || "";
    const isOAuth = searchParams.get("oauth") === "true";
    const intentRole = searchParams.get("intentRole") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            router.replace("/login");
        }
    }, [email, router]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last digit
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits filled
        if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split("");
            setOtp(newOtp);
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (otpCode: string) => {
        if (otpCode.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth`;
            const res = await fetch(`${apiUrl}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);

                // Store auth data
                localStorage.clear();
                localStorage.setItem("loginType", isOAuth ? "oauth" : "manual");
                if (data.token) localStorage.setItem("token", data.token);
                localStorage.setItem("fullName", data.user?.fullName || "");
                localStorage.setItem("email", data.user?.email || "");
                localStorage.setItem("role", data.user?.role || "");
                localStorage.setItem("currentUser", JSON.stringify(data.user));

                // Redirect based on role
                setTimeout(() => {
                    const role = data.user?.role;
                    if (role === "client") {
                        router.replace("/client/dashboard");
                    } else if (role === "freelancer") {
                        router.replace("/freelancer/dashboard");
                    } else {
                        router.replace("/choose-role");
                    }
                }, 1000);
            } else {
                setError(data.message || "Verification failed");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setOtp(["", "", "", "", "", ""]);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;

        setResending(true);
        setError("");

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth`;
            const res = await fetch(`${apiUrl}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: isOAuth ? "oauth" : "login" }),
            });

            const data = await res.json();

            if (res.ok) {
                setCooldown(60);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                setError(data.message || "Failed to resend OTP");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Verify Your Identity</h1>
                    <p className="text-zinc-500">
                        We sent a 6-digit code to<br />
                        <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                {/* OTP Input */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-6">
                    <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={loading || success}
                                className={`w-12 h-14 text-center text-2xl font-bold bg-zinc-800 border-2 rounded-xl 
                  focus:outline-none transition-all
                  ${error ? "border-red-500" : digit ? "border-white" : "border-zinc-700"}
                  ${success ? "border-green-500 bg-green-500/10" : ""}
                  disabled:opacity-50`}
                            />
                        ))}
                    </div>

                    {/* Error/Success Message */}
                    {error && (
                        <div className="text-red-400 text-sm text-center mb-4 flex items-center justify-center gap-2">
                            <span>✕</span> {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-400 text-sm text-center mb-4 flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Verified! Redirecting...
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={() => handleVerify(otp.join(""))}
                        disabled={loading || success || otp.some(d => d === "")}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 size={20} /> Verified
                            </>
                        ) : (
                            "Verify Code"
                        )}
                    </button>
                </div>

                {/* Resend */}
                <div className="text-center">
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || resending}
                        className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                    </button>
                </div>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push("/login")}
                        className="text-zinc-600 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            }
        >
            <VerifyOTPContent />
        </Suspense>
    );
}
