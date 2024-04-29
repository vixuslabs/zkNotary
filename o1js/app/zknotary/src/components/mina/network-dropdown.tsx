"use client";

import React from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { useMinaStore } from "@/components/providers/mina-provider";
import { NetworkName } from "@/stores/mina-store";
import { ChainInfoArgs, ProviderError } from "@aurowallet/mina-provider";
import { toast } from "sonner";

export default function NetworkDropdown() {
  const { setWallet, wallet } = useMinaStore((state) => state);

  const onNetworkChanged = async (network: NetworkName) => {
    // @ts-ignore
    if (typeof window.mina === "undefined") {
      return;
    }

    // @ts-ignore
    let mina = window.mina;

    // @ts-ignore
    let chain: ChainInfoArgs | ProviderError = await mina
      .switchChain({ chainId: network })
      .catch((err: ProviderError) => err);

    if (typeof chain === "object" && "message" in chain) {
      toast.error((chain as ProviderError).message);
      return;
    }

    // if (wallet.isSignedIn) {
    //   setWallet({ ...wallet, activeNetwork: network });
    // }
  };

  // return (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger asChild>
  //       <Button variant="outline" disabled={!wallet.isSignedIn}>
  //         Network
  //         <span className="ml-2">
  //           <ChevronDownIcon className="h-4 w-4" />
  //         </span>
  //       </Button>
  //     </DropdownMenuTrigger>
  //     <DropdownMenuContent>
  //       <DropdownMenuCheckboxItem
  //         checked={wallet.activeNetwork === "mainnet"}
  //         onCheckedChange={(checked) => checked && onNetworkChanged("mainnet")}
  //       >
  //         Mainnet
  //       </DropdownMenuCheckboxItem>
  //       <DropdownMenuCheckboxItem
  //         checked={wallet.activeNetwork === "berkeley"}
  //         onCheckedChange={(checked) => checked && onNetworkChanged("berkeley")}
  //       >
  //         Berkley
  //       </DropdownMenuCheckboxItem>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // );
}
