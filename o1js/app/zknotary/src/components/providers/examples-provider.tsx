"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";

import { ExamplesStore } from "../examples-store";

export const ExamplesContext = createContext<StoreApi<ExamplesStore> | null>(
  null
);

export function ExamplesProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<ExamplesStore> | null>(null);
  return (
    <ExamplesContext.Provider value={storeRef.current}>
      {children}
    </ExamplesContext.Provider>
  );
}

export const useExamplesStore = <T,>(selector: (store: ExamplesStore) => T) => {
  const store = useContext(ExamplesContext);
  if (!store)
    throw new Error("useExamplesStore must be used within a ExamplesProvider");
  return useStore(store, selector);
};
