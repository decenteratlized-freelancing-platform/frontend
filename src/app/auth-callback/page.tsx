"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AuthCallbackPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Debug logging
        console.log("Auth Callback - Status:", status, "Session:", session);

        if (status === "loading") return;

        // Give a brief moment for session to fully establish
        const timer = setTimeout(() => {
            if (status === "authenticated" && session?.user) {
                const role = (session.user as any).role;
                console.log("Auth Callback - User role:", role);

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
                console.log("Auth Callback - Unauthenticated, redirecting to login");
                router.replace("/login");
            }
        }, 500); // Small delay to allow session to settle

        return () => clearTimeout(timer);
    }, [session, status, router, hasChecked]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <h2 className="text-white text-xl font-semibold animate-pulse">
                    Authenticating...
                </h2>
                <p className="text-zinc-500 text-sm">Status: {status}</p>
            </div>
        </div>
    );
}

