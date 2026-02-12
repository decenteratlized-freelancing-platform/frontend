"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SupportTicketsRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login?callbackUrl=/support");
      return;
    }

    const role = (session.user as any).role;
    if (role === "client") {
      router.push("/client/support");
    } else if (role === "freelancer") {
      router.push("/freelancer/support");
    } else {
      router.push("/");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400">Redirecting to your support dashboard...</p>
      </div>
    </div>
  );
}
