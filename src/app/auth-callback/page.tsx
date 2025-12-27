"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AuthCallbackPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (session?.user?.role) {
            if (session.user.role === "client") {
                router.replace("/client/dashboard");
            } else if (session.user.role === "freelancer") {
                router.replace("/freelancer/dashboard");
            } else {
                router.replace("/choose-role");
            }
        } else if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [session, status, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <h2 className="text-white text-xl font-semibold animate-pulse">
                    Authenticating...
                </h2>
            </div>
        </div>
    );
}
