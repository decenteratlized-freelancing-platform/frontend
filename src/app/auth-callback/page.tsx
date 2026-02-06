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

    useEffect(() => {
        // Debug logging
        // console.log("Auth Callback - Status:", status, "Session:", session);

        if (status === "loading" || processing) return;

        const processAuth = async () => {
            if (status === "authenticated" && session?.user) {
                let role = (session.user as any).role;
                const intentRole = searchParams.get("intentRole");

                // If role is pending and we have an intent, update it
                if ((!role || role === "pending") && intentRole) {
                    setProcessing(true);
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/update-role`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                                email: session.user.email, 
                                role: intentRole 
                            }),
                        });

                        if (res.ok) {
                            // Force session update to reflect new role
                            await update({ role: intentRole });
                            role = intentRole;
                        }
                    } catch (err) {
                        console.error("Failed to update role from intent:", err);
                    } finally {
                        setProcessing(false);
                    }
                }

                console.log("Auth Callback - Final User role:", role);

                if (role === "client") {
                    router.replace("/client/dashboard");
                } else if (role === "freelancer") {
                    router.replace("/freelancer/dashboard");
                } else {
                    // Role is pending or not set - go to choose role
                    router.replace("/choose-role");
                }
            } else if (status === "unauthenticated" && !hasChecked) {
                // Only redirect to login if we've confirmed unauthenticated
                setHasChecked(true);
                // console.log("Auth Callback - Unauthenticated, redirecting to login");
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
                    {processing ? "Setting up your account..." : "Authenticating..."}
                </h2>
                <p className="text-zinc-500 text-sm">Status: {processing ? "Updating Role" : status}</p>
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

