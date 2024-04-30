"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useMinaStore } from "../providers/mina-provider";

export default function LocalToggle() {
  const { localMode, setLocalMode } = useMinaStore((state) => state);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Switch
            checked={localMode}
            onCheckedChange={(checked) => setLocalMode(checked)}
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-24">
          <p>
            Toggle to set whether you would like to interact with a blockchain
            or not
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
