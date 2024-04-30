import { create } from "zustand";

import { githubContent, etherscanContent, homeContent } from "@/lib/constants";
import { RootSchemaValuesType } from "@/lib/proof_types";

export type ExampleNames = "github" | "etherscan";

export type NotorizedRawData = RootSchemaValuesType;

export type AllProofData = {
  github: NotorizedRawData | null;
  etherscan: NotorizedRawData | null;
};

export type AllVerifiedData = {
  github: string | null;
  etherscan: string | null;
};

export type ExamplesState = {
  examples: ExampleNames[];
  active: ExampleNames | null;
  activeContent: ActiveContent;
  isFetching: boolean;
  proofData: AllProofData;
  verifiedData: AllVerifiedData;
};

export type ActiveContent = {
  title: string;
  description: string;
  instructions: string[];
};

export type ExamplesAction = {
  setActive: (example: ExampleNames | null) => void;
  setFetching: (isFetching: boolean) => void;
  setProofData: (data: NotorizedRawData, example: ExampleNames) => void;
  setVerifiedData: (data: string, example: ExampleNames) => void;
};

export type ExamplesStore = ExamplesState & ExamplesAction;

export const defaultExamplesState: ExamplesState = {
  examples: ["github", "etherscan"],
  active: null,
  activeContent: homeContent,
  isFetching: false,
  proofData: {
    github: null,
    etherscan: null,
  },
  verifiedData: {
    github: null,
    etherscan: null,
  },
};

export const useExamplesStore = create<ExamplesStore>()((set) => ({
  examples: ["github", "etherscan"],
  active: null,
  activeContent: homeContent,
  isFetching: false,
  proofData: {
    github: null,
    etherscan: null,
  },
  verifiedData: {
    github: null,
    etherscan: null,
  },
  setFetching: (isFetching: boolean) => set({ isFetching }),
  setActive: (example: ExampleNames | null) => {
    set({
      active: example,
      activeContent:
        example === "github"
          ? githubContent
          : example === "etherscan"
          ? etherscanContent
          : homeContent,
    });
  },
  setProofData: (data: NotorizedRawData, example: ExampleNames) => {
    console.log("--- Inside setNotorizedData ---");
    console.log("data: ", data);
    console.log("example: ", example);

    set((state) => {
      return {
        ...state,
        proofData: { ...state.proofData, [example]: data },
      };
    });
  },
  setVerifiedData: (data: string, example: ExampleNames) => {
    console.log("--- Inside setVerifiedData ---");
    console.log("data: ", data);
    console.log("example: ", example);
    set((state) => ({
      verifiedData: { ...state.verifiedData, [example]: data },
    }));
  },
}));

export const createExamplesStore = (
  initState: ExamplesState = defaultExamplesState
) => {
  return useExamplesStore;
  // return create<ExamplesStore>()((set) => ({
  //   ...initState,
  //   setFetching: (isFetching: boolean) => set({ isFetching }),
  //   setActive: (example: ExampleNames | null) => set({ active: example }),
  //   setNotorizedData: (data: NotorizedRawData, example: ExampleNames) =>
  //     set((state) => ({
  //       proofData: { ...state.proofData, [example]: data },
  //     })),
  //   setVerifiedData: (data: string, example: ExampleNames) =>
  //     set((state) => ({
  //       verifiedData: { ...state.verifiedData, [example]: data },
  //     })),
  // }));
};
