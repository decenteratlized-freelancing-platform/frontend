"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChooseRolePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
    } else if (session.user.role && session.user.role !== "pending") {
      router.replace(
        session.user.role === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard"
      );
    }
  }, [status, session, router]);

  const handleRoleSelect = async (role: string) => {
    if (!session?.user?.email) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: session.user.email, role, name: session.user.name, image: session.user.image }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      await update();
      router.replace(role === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard");
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-6">
      <h1 className="text-2xl font-bold">Choose your role</h1>
      <div className="flex gap-4">
        <button
          onClick={() => handleRoleSelect("freelancer")}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          Freelancer
        </button>
        <button
          onClick={() => handleRoleSelect("client")}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={loading}
        >
          Client
        </button>
      </div>
      {loading && <p>Updating your role...</p>}
    </div>
  );
}
