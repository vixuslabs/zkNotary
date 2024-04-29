"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import {
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  LogOutIcon,
} from "lucide-react";
import { useMinaStore } from "@/components/providers/mina-provider";
import { toast } from "sonner";
import { ChainInfoArgs, ProviderError } from "@aurowallet/mina-provider";
import { NetworkName } from "@/stores/mina-store";

export default function WalletSection() {
  const [open, setOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { wallet, setWallet, signOut } = useMinaStore((state) => state);

  const handleSignIn = useCallback(async () => {
    // @ts-ignore
    if (typeof window.mina === "undefined") {
      toast.warning("Mina extension not found");
      return;
    }

    // @ts-ignore
    let mina = window.mina;

    // @ts-ignore
    const account: string[] | ProviderError = await mina
      .requestAccounts()
      .catch((err: ProviderError) => err);

    if (typeof account === "object" && "message" in account) {
      toast.error((account as ProviderError).message);
      return;
    }

    // @ts-ignore
    const network: ChainInfoArgs | ProviderError = await window.mina
      ?.switchChain({ chainId: "devnet" })
      .catch((err: ProviderError) => err);

    if (typeof network === "object" && "message" in network) {
      toast.warning((network as ProviderError).message);
    }

    const networkName = network?.name as NetworkName;

    setWallet({
      isSignedIn: true,
      address: account[0],
      activeNetwork: networkName || "devnet",
    });

    console.log(account);
  }, [wallet]);

  const buttonCopy = useMemo(() => {
    return {
      notConnected: "Connect",
      loading: "loading...",
      success: "Wallet",
    };
  }, [wallet.isSignedIn, isSigningIn]);

  const handleSignOut = useCallback(() => {
    if (wallet.isSignedIn) {
      signOut();
      console.log("signing out");

      toast.success("Signed out");
    }
  }, [wallet.isSignedIn]);

  return (
    <DropdownMenu
      open={wallet.isSignedIn && open}
      onOpenChange={(nowOpen) => {
        if (wallet.isSignedIn) {
          setOpen(nowOpen);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2"
          variant="outline"
          onClick={!wallet.isSignedIn ? handleSignIn : undefined}
        >
          {wallet.isSignedIn ? (
            <>
              <span className="truncate">{`${wallet.address.slice(
                0,
                4
              )}...${wallet.address.slice(-4)}`}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </>
          ) : isSigningIn ? (
            <span className="truncate">{"loading..."}</span>
          ) : (
            <span className="truncate">{"Connect"}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center justify-between">
          <CopyIcon className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          <Link
            className="flex items-center gap-2 justify-between"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="mr-2 h-4 w-4" />
            View on Minascan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center justify-between"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
