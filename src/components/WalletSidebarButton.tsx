"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  Loader2,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";

interface WalletSidebarButtonProps {
  isCollapsed: boolean;
}

export function WalletSidebarButton({ isCollapsed }: WalletSidebarButtonProps) {
  const { address, connectWallet, disconnectWallet, isConnecting } = useWalletConnection();

  const handleWalletClick = useCallback(async () => {
    await connectWallet();
  }, [connectWallet]);

  const walletLabel = useMemo(() => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return isConnecting ? "Connecting..." : "Connect Wallet";
  }, [address, isConnecting]);

  if (address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between bg-white/5 hover:bg-blue-500 border-white/20 text-white hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {!isCollapsed && <span className="text-xs font-medium">{walletLabel}</span>}
            </span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-xl hover:text-red-800">
          <DropdownMenuItem onClick={disconnectWallet} className="text-red-400 hover:bg-red-500 cursor-pointer hover:text-red-800">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect Wallet</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-between bg-white/5 hover:bg-blue-500 border-white/20 text-white hover:text-white"
      onClick={handleWalletClick}
      disabled={isConnecting}
    >
      <span className="flex items-center gap-2">
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">{walletLabel}</span>
      </span>
    </Button>
  );
}
