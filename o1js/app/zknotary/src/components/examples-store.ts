import { create } from "zustand";

import { githubContent, etherscanContent, homeContent } from "@/lib/constants";
import { RootSchemaSuccessType } from "@/lib/proof_types";

export type ExampleNames = "github" | "etherscan";

export type NotorizedRawData = RootSchemaSuccessType;

export type AllNotorizedData = {
  github: NotorizedRawData | null;
  etherscan: NotorizedRawData | null;
};

export type ExamplesState = {
  examples: ExampleNames[];
  active: ExampleNames | null;
  activeContent: ActiveContent;
  isFetching: boolean;
  notorizedData: AllNotorizedData;
};

export type ActiveContent = {
  title: string;
  description: string;
  instructions: string[];
};

export type ExamplesAction = {
  setActive: (example: ExampleNames | null) => void;
  setFetching: (isFetching: boolean) => void;
  setNotorizedData: (data: NotorizedRawData, example: ExampleNames) => void;
};

export type ExamplesStore = ExamplesState & ExamplesAction;

export const defaultExamplesState: ExamplesState = {
  examples: ["github", "etherscan"],
  active: null,
  activeContent: homeContent,
  isFetching: false,
  notorizedData: {
    github: null,
    etherscan: null,
  },
};

export const useExamplesStore = create<ExamplesStore>()((set) => ({
  examples: ["github", "etherscan"],
  active: null,
  activeContent: homeContent,
  isFetching: false,
  notorizedData: {
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
  setNotorizedData: (data: NotorizedRawData, example: ExampleNames) => {
    console.log("--- Inside setNotorizedData ---");
    console.log("data: ", data);
    console.log("example: ", example);

    set((state) => {
      return {
        ...state,
        notorizedData: { ...state.notorizedData, [example]: data },
      };
    });
  },
}));

export const createExamplesStore = (
  initState: ExamplesState = defaultExamplesState
) => {
  return create<ExamplesStore>()((set) => ({
    ...initState,
    setFetching: (isFetching: boolean) => set({ isFetching }),
    setActive: (example: ExampleNames | null) => set({ active: example }),
    setNotorizedData: (data: NotorizedRawData, example: ExampleNames) =>
      set((state) => ({
        notorizedData: { ...state.notorizedData, [example]: data },
      })),
  }));
};
