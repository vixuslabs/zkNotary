"use client";
/* eslint-disable */

import React, { useEffect } from "react";

import { useMinaStore } from "@/components/providers/mina-provider";
import { ChainInfoArgs } from "@aurowallet/mina-provider";
import { NetworkName } from "@/stores/mina-store";

export default function MinaEventHandler() {
  const { setWallet, wallet, signOut } = useMinaStore((state) => state);

  useEffect(() => {
    // @ts-expect-error
    if (typeof window.mina === "undefined") {
      return;
    }

    // @ts-expect-error
    let mina = window.mina;

    mina.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        signOut();
      } else if (wallet.isSignedIn) {
        setWallet({ ...wallet, address: accounts[0] });
      }
    });

    mina.on("chainChanged", (chainInfo: ChainInfoArgs) => {
      console.log("chainChanged", chainInfo);

      if (!wallet.isSignedIn) return;

      if (wallet.activeNetwork === chainInfo.chainId) return;

      console.log("setting to new network", chainInfo.chainId);

      let chainName = chainInfo.chainId as NetworkName;

      setWallet({ ...wallet, activeNetwork: chainName });
    });
  }, []);

  return null;
}
