"use client";

import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import ProofDataContainer from "./proof-data-container";

import { GithubForm, EtherscanForm } from "@/components/forms/";
import { useExamplesStore } from "@/stores/examples-store";
import { useEffect, useState } from "react";
import VerifiedDataContainer from "./verified-data-container";
import VerifyTranscript from "./mina/verify-transcript";

type Tabs = "config" | "formatted" | "raw";

export default function MainSectionContainer() {
  const { active, activeContent, isFetching } = useExamplesStore(
    (state) => state
  );
  const [currentTab, setCurrentTab] = useState<Tabs>("config");

  useEffect(() => {
    if (!active) {
      setCurrentTab("config");
    }
  }, [active]);

  return (
    <div className="grid min-h-full md:min-h-[650px] grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
      <div className="bg-secondary rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">{activeContent.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {activeContent.description}
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          {activeContent.instructions.map((instruction, index) => (
            <li key={index} className="text-gray-600 dark:text-gray-400">
              {instruction}
            </li>
          ))}
        </ol>
      </div>
      <div className="h-full rounded-lg shadow-lg p-6">
        <Tabs
          value={currentTab}
          onValueChange={(selected) => setCurrentTab(selected as Tabs)}
          className="w-full"
          defaultValue="config"
        >
          <TabsList className="grid w-full grid-cols-4 gap-2 mb-4">
            <TabsTrigger disabled={!active || isFetching} value="config">
              Configuration
            </TabsTrigger>
            <TabsTrigger disabled={!active || isFetching} value="proof">
              Proof
            </TabsTrigger>
            <TabsTrigger disabled={!active || isFetching} value="transcript">
              Transcript
            </TabsTrigger>
            <TabsTrigger disabled={!active || isFetching} value="verify">
              Verify
            </TabsTrigger>
          </TabsList>
          <TabsContent value="config">
            {active === "etherscan" ? (
              <EtherscanForm />
            ) : active === "github" ? (
              <GithubForm />
            ) : (
              <p>This the home content!</p>
            )}
          </TabsContent>
          <TabsContent
            value="proof"
            className="min-h-full flex-1 justify-center items-center align-middle"
          >
            <ProofDataContainer />
          </TabsContent>
          <TabsContent
            value="transcript"
            className="min-h-full flex-1 justify-center items-center align-middle"
          >
            <VerifiedDataContainer />
          </TabsContent>
          <TabsContent value="verify">
            <VerifyTranscript />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
