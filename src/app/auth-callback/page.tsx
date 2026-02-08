"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

function AuthCallbackContent() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hasChecked, setHasChecked] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [statusText, setStatusText] = useState("Authenticating...");

    useEffect(() => {
        if (status === "loading" || processing) return;

        const processAuth = async () => {
            if (status === "authenticated" && session?.user) {
                setProcessing(true);
                let role = (session.user as any).role;
                const intentRole = searchParams.get("intentRole");
                const userEmail = session.user.email;

                // If role is pending and we have an intent, update it
                if ((!role || role === "pending") && intentRole) {
                    setStatusText("Setting up your account...");
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/update-role`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: userEmail,
                                role: intentRole
                            }),
                        });

                        if (res.ok) {
                            await update({ role: intentRole });
                            role = intentRole;
                        }
                    } catch (err) {
                        console.error("Failed to update role from intent:", err);
                    }
                }

                // Send OTP for OAuth login
                setStatusText("Sending verification code...");
                try {
                    const otpRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/send-otp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: userEmail,
                            type: "oauth"
                        }),
                    });

                    if (otpRes.ok) {
                        // Redirect to OTP verification page
                        const params = new URLSearchParams({
                            email: userEmail || "",
                            oauth: "true",
                        });
                        if (intentRole) params.set("intentRole", intentRole);

                        router.replace(`/verify-otp?${params.toString()}`);
                    } else {
                        const data = await otpRes.json();
                        console.error("Failed to send OTP:", data.message);
                        // If OTP fails, still try to redirect based on role
                        if (role === "client") {
                            router.replace("/client/dashboard");
                        } else if (role === "freelancer") {
                            router.replace("/freelancer/dashboard");
                        } else {
                            router.replace("/choose-role");
                        }
                    }
                } catch (err) {
                    console.error("Error sending OTP:", err);
                    // Fallback redirect
                    if (role === "client") {
                        router.replace("/client/dashboard");
                    } else if (role === "freelancer") {
                        router.replace("/freelancer/dashboard");
                    } else {
                        router.replace("/choose-role");
                    }
                }
            } else if (status === "unauthenticated" && !hasChecked) {
                setHasChecked(true);
                router.replace("/login");
            }
        };

        processAuth();
    }, [session, status, router, hasChecked, searchParams, update, processing]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <h2 className="text-white text-xl font-semibold animate-pulse">
                    {statusText}
                </h2>
                <p className="text-zinc-500 text-sm">Status: {processing ? "Processing" : status}</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <AuthCallbackContent />
        </Suspense>
    );
}
