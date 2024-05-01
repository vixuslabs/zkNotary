"use client";

import React, { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { useExamplesStore } from "@/stores/examples-store";

export default function VerifiedDataContainer() {
  const { verifiedData, active } = useExamplesStore((state) => state);
  const [jsonData, setJsonData] = useState<string>("");

  useEffect(() => {
    switch (active) {
      case "etherscan":
        // let etherscanJson = JSON.stringify(verifiedData.etherscan, null, 2);
        setJsonData(verifiedData.etherscan ?? "");
        break;
      case "github":
        // let json = JSON.stringify(verifiedData.github, null, 2);
        setJsonData(verifiedData.github ?? "");
        break;
      default:
        setJsonData("");
        break;
    }
  }, [verifiedData, active]);

  return (
    <Textarea
      disabled
      className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg my-auto min-h-[calc(520px-36px)] max-h-[calc(520px-36px)] h-full"
      value={jsonData}
    />
  );
}
