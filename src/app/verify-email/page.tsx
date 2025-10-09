"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");
  const tokenParam = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "failed">(
    statusParam === "success" ? "success" : statusParam === "failed" ? "failed" : "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If backend redirected with ?status=success/failed we already set status above.
    if (statusParam) {
      setMessage(statusParam === "success" ? "Verification successful." : "Verification failed.");
      return;
    }

    // If token present (link may point to frontend with token) call backend verify endpoint via fetch
    const doVerify = async () => {
      if (!tokenParam) return;
      setStatus("verifying");
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/verify-email?token=${encodeURIComponent(tokenParam)}`;
        const res = await fetch(backendUrl, { headers: { Accept: "application/json" } });
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setStatus("success");
          setMessage("Your email has been verified. You can now log in.");
          // update URL to show status param for consistency
          router.replace(`/verify-email?status=success`, { scroll: false });
        } else {
          setStatus("failed");
          setMessage(data.message || "Verification failed or token expired.");
          router.replace(`/verify-email?status=failed`, { scroll: false });
        }
      } catch (err: any) {
        console.error("Verification request error:", err);
        setStatus("failed");
        setMessage("Verification failed due to a network/server error.");
        router.replace(`/verify-email?status=failed`, { scroll: false });
      }
    };

    doVerify();
  }, [tokenParam, statusParam, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-xl w-full bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

        {status === "idle" && <p className="text-gray-300">Waiting for verification...</p>}

        {status === "verifying" && <p className="text-blue-400">Verifying your email...</p>}

        {status === "success" && (
          <>
            <p className="text-green-400 font-semibold mb-4">{message || "Verification successful."}</p>
            <p className="text-gray-300 mb-6">Welcome to SmartHire — a welcome email has been sent to your inbox.</p>
            <a href="/login" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded font-semibold">Go to Login</a>
          </>
        )}

        {status === "failed" && (
          <>
            <p className="text-red-400 font-semibold mb-4">{message || "Verification failed."}</p>
            <p className="text-gray-300 mb-6">Possible reasons: token expired or already used.</p>
            <div className="flex gap-3">
              <a href="/signup" className="px-4 py-2 border rounded">Sign Up</a>
              <a href="/login" className="px-4 py-2 border rounded">Login</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
