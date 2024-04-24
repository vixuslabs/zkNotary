import { create } from "zustand";

export type Example = "github" | "discord";

export type ExamplesState = {
  examples: Example[];
  active: Example | null;
};

export type ExamplesAction = {
  setActive: (example: Example | null) => void;
};

export type ExamplesStore = ExamplesState & ExamplesAction;

export const defaultExamplesState: ExamplesState = {
  examples: ["github", "discord"],
  active: null,
};

export const useExamplesStore = create<ExamplesStore>()((set) => ({
  examples: ["github", "discord"],
  active: null,
  setActive: (example: Example | null) => set({ active: example }),
}));

export const createExamplesStore = (
  initState: ExamplesState = defaultExamplesState
) => {
  return create<ExamplesStore>()((set) => ({
    ...initState,
    setActive: (example: Example | null) => set({ active: example }),
  }));
};
