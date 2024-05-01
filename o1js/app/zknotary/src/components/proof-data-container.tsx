"use client";

import React, { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { useExamplesStore } from "@/stores/examples-store";

export default function ProofDataContainer() {
  const { proofData, active } = useExamplesStore((state) => state);
  const [jsonData, setJsonData] = useState<string>("");

  useEffect(() => {
    switch (active) {
      case "etherscan":
        let etherscanJson = JSON.stringify(proofData.etherscan, null, 2);
        setJsonData(proofData.etherscan ? etherscanJson : "");
        break;
      case "github":
        let json = JSON.stringify(proofData.github, null, 2);
        setJsonData(proofData.github ? json : "");
        break;
      default:
        setJsonData("");
        break;
    }
  }, [proofData, active]);

  return (
    <Textarea
      disabled
      className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg my-auto min-h-[calc(520px-36px)] max-h-[calc(520px-36px)] h-full"
      value={jsonData}
    />
  );
}
