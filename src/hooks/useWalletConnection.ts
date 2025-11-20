"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  isMetaMask?: boolean;
};

export function useWalletConnection() {
  const { data: session, update } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAddress, setLocalAddress] = useState<string | null>(null);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);

  const address = useMemo(() => {
    if (localAddress) return localAddress;
    if (session?.user) return (session.user as any)?.walletAddress ?? null;
    // Check localStorage for manual login
    if (typeof window !== "undefined") {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        return currentUser?.walletAddress ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }, [localAddress, session?.user]);

  const walletLinkedAt = useMemo(() => {
    return linkedAt ?? ((session?.user as any)?.walletLinkedAt ?? null);
  }, [linkedAt, session?.user]);

  const connectWallet = useCallback(async () => {
    // Support both NextAuth session and manual login
    const userEmail = session?.user?.email || (typeof window !== "undefined" ? localStorage.getItem("email") : null);
    
    if (!userEmail) {
      toast({
        title: "Please sign in",
        description: "Please sign in before linking a wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is available
      if (typeof window === "undefined") {
        throw new Error("This feature is only available in the browser.");
      }

      const provider = (window as any).ethereum as EthereumProvider | undefined;

      if (!provider) {
        throw new Error(
          "MetaMask extension not found. Please install MetaMask from https://metamask.io/"
        );
      }

      if (!provider.isMetaMask) {
        throw new Error(
          "MetaMask extension not detected. Please make sure MetaMask is installed and enabled."
        );
      }

      // Request account access
      let accounts: string[];
      try {
        accounts = await provider.request({
          method: "eth_requestAccounts",
        });
      } catch (err: any) {
        if (err.code === 4001) {
          throw new Error("Please connect your MetaMask account to continue.");
        }
        if (err.code === -32002) {
          throw new Error("A MetaMask connection request is already pending. Please check your MetaMask extension.");
        }
        throw new Error(`Failed to connect: ${err.message || "Unknown error"}`);
      }

      const account = accounts?.[0];
      if (!account) {
        throw new Error("No account returned from MetaMask. Please unlock your wallet.");
      }

      // Create message for signature
      const message = [
        "SmartHire Wallet Link",
        "",
        `Account: ${account}`,
        `User: ${userEmail}`,
        `Timestamp: ${new Date().toISOString()}`,
        "",
        "By signing this message, you are linking your wallet to your SmartHire account.",
      ].join("\n");

      // Request signature
      let signature: string;
      try {
        signature = await provider.request({
          method: "personal_sign",
          params: [message, account],
        });
      } catch (err: any) {
        if (err.code === 4001) {
          throw new Error("Signature request was rejected. Please try again and approve the signature.");
        }
        throw new Error(`Failed to sign message: ${err.message || "Unknown error"}`);
      }

      // Send to backend (include email for manual login)
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account,
          message,
          signature,
          email: userEmail, // Include email for manual login support
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(payload.error || `Server error: ${response.status}`);
      }

      const payload = await response.json();
      const savedAddress = payload.walletAddress as string | undefined;
      const savedLinkedAt = payload.walletLinkedAt as string | undefined;

      setLocalAddress(savedAddress ?? account);
      setLinkedAt(savedLinkedAt ?? null);

      // Update session (only if NextAuth session exists)
      if (session?.user && update) {
        await update({
          user: {
            ...(session.user as any),
            walletAddress: savedAddress ?? account,
            walletLinkedAt: savedLinkedAt ?? new Date().toISOString(),
          },
        });
      } else {
        // For manual login, store in localStorage
        if (typeof window !== "undefined") {
          const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
          localStorage.setItem("currentUser", JSON.stringify({
            ...currentUser,
            walletAddress: savedAddress ?? account,
            walletLinkedAt: savedLinkedAt ?? new Date().toISOString(),
          }));
        }
      }

      toast({
        title: "Wallet connected successfully!",
        description: `Your MetaMask wallet (${account.slice(0, 6)}...${account.slice(-4)}) is now linked.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred.";
      setError(message);
      toast({
        title: "Wallet connection failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [session, update, toast]);

  const disconnectWallet = useCallback(() => {
    setLocalAddress(null);
    setLinkedAt(null);
  }, []);

  return {
    address,
    walletLinkedAt,
    error,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
}

