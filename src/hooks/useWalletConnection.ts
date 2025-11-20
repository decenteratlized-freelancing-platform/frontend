"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
};

export function useWalletConnection() {
  const { data: session, update } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAddress, setLocalAddress] = useState<string | null>(null);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const address = useMemo(() => {
    if (isDisconnected) return null;
    if (localAddress) return localAddress;
    if (session?.user) return (session.user as any)?.walletAddress ?? null;

    if (typeof window !== "undefined") {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        return currentUser?.walletAddress ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }, [localAddress, session?.user, isDisconnected]);

  const walletLinkedAt = useMemo(() => {
    if (isDisconnected) return null;
    return linkedAt ?? ((session?.user as any)?.walletLinkedAt ?? null);
  }, [linkedAt, session?.user, isDisconnected]);

  const connectWallet = useCallback(async () => {
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
    setIsDisconnected(false);

    try {
      if (typeof window === "undefined") {
        throw new Error("This feature is only available in the browser.");
      }

      let provider = (window as any).ethereum;

      // Strict MetaMask detection
      if (provider?.providers) {
        // If multiple providers are injected (EIP-6963), find MetaMask specifically
        provider = provider.providers.find((p: any) => p.isMetaMask);
      }

      // If the provider itself is not MetaMask (and we didn't find it in providers array),
      // or if it doesn't exist at all.
      if (!provider || !provider.isMetaMask) {
        throw new Error(
          "MetaMask is not detected. Please install MetaMask from https://metamask.io/ to continue."
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

      // Send to backend
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account,
          message,
          signature,
          email: userEmail,
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

      if (session?.user && update) {
        await update({
          user: {
            ...(session.user as any),
            walletAddress: savedAddress ?? account,
            walletLinkedAt: savedLinkedAt ?? new Date().toISOString(),
          },
        });
      } else {
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

  const disconnectWallet = useCallback(async () => {
    setLocalAddress(null);
    setLinkedAt(null);
    setIsDisconnected(true);

    if (typeof window !== "undefined") {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (currentUser.walletAddress) {
        const { walletAddress, walletLinkedAt, ...rest } = currentUser;
        localStorage.setItem("currentUser", JSON.stringify(rest));
      }
    }

    if (session?.user && update) {
      await update({
        user: {
          ...(session.user as any),
          walletAddress: null,
          walletLinkedAt: null,
        },
      });
    }

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [session, update, toast]);

  return {
    address,
    walletLinkedAt,
    error,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
}
