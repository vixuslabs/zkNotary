"use client";

import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import ProofDataContainer from "@/components/proof-data-container";
import useMeasure from "react-use-measure";

import { GithubForm, EtherscanForm } from "@/components/forms/";
import { useExamplesStore } from "@/stores/examples-store";
import { useEffect, useMemo, useState } from "react";
import VerifiedDataContainer from "@/components/verified-data-container";
import VerifyTranscript from "@/components/mina/verify-transcript";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

type Tabs = "config" | "proof" | "transcript" | "verify";

type TabContentDirection = -1 | 1;

enum TabTitles {
  Config = 1,
  Proof = 2,
  Transcript = 3,
  Verify = 4,
}

const variants = {
  initial: (direction: TabContentDirection) => {
    return { z: `${110 * direction}%`, opacity: 0 };
  },
  active: { z: "0%", opacity: 1 },
  exit: (direction: TabContentDirection) => {
    return { z: `${-110 * direction}%`, opacity: 0 };
  },
};

export default function MainSectionContainer() {
  const { active, activeContent, isFetching } = useExamplesStore(
    (state) => state
  );
  const [currentTab, setCurrentTab] = useState<TabTitles>(TabTitles.Config);
  const [direction, setDirection] = useState<TabContentDirection>(1);
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    if (!active) {
      setCurrentTab(TabTitles.Config);
    }
  }, [active]);

  // useEffect(() => {
  //   console.log("currentTab", currentTab);
  // }, [currentTab]);

  const handleTabChange = (prev: TabTitles, selected: TabTitles) => {
    if (prev - selected > 0) {
      setDirection(-1);
    } else {
      setDirection(1);
    }

    console.log("prev", prev, "selected", selected);
  };

  const content = useMemo(() => {
    console.log("content- currentTab", currentTab);

    if (currentTab === TabTitles.Config) {
      return active ? (
        active === "github" ? (
          <GithubForm />
        ) : (
          <EtherscanForm />
        )
      ) : (
        <></>
      );
    } else if (currentTab === TabTitles.Proof) {
      return <ProofDataContainer />;
    } else if (currentTab === TabTitles.Transcript) {
      return <VerifiedDataContainer />;
    } else if (currentTab === TabTitles.Verify) {
      return <VerifyTranscript />;
    }
  }, [currentTab, active, activeContent]);

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
        <MotionConfig transition={{ duration: 0.15, type: "tween", bounce: 0 }}>
          <motion.div animate={{ height: bounds.height }}>
            <Tabs
              value={currentTab.toString()}
              className="w-full"
              defaultValue="config"
            >
              <motion.div layout>
                <TabsList className="grid w-full grid-cols-4 gap-2 mb-4">
                  <TabsTrigger
                    disabled={!active || isFetching}
                    value={TabTitles.Config.toString()}
                    onClick={() => {
                      handleTabChange(currentTab, 1);
                      setCurrentTab(1 as TabTitles);
                    }}
                  >
                    Config
                  </TabsTrigger>
                  <TabsTrigger
                    disabled={!active || isFetching}
                    value={TabTitles.Proof.toString()}
                    onClick={() => {
                      handleTabChange(currentTab, 2);
                      setCurrentTab(2 as TabTitles);
                    }}
                  >
                    Proof
                  </TabsTrigger>
                  <TabsTrigger
                    disabled={!active || isFetching}
                    value={TabTitles.Transcript.toString()}
                    onClick={() => {
                      handleTabChange(currentTab, 3);
                      setCurrentTab(3 as TabTitles);
                    }}
                  >
                    Transcript
                  </TabsTrigger>
                  <TabsTrigger
                    disabled={!active || isFetching}
                    value={TabTitles.Verify.toString()}
                    onClick={() => {
                      handleTabChange(currentTab, 4);
                      setCurrentTab(4 as TabTitles);
                    }}
                  >
                    Verify
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <div ref={ref}>
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={currentTab}
                    variants={variants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    custom={direction}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </motion.div>
        </MotionConfig>
      </div>
    </div>
  );
}
