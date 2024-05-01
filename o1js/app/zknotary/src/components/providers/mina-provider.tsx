"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";

import { MinaStore, createMinaStore } from "@/stores/mina-store";

// type VerifierType = "standalone" | "blockchain";
//
// export interface MinaProviderProps {
//   initialized: boolean;
//   verifier: TlsnVerifier;
//   verifierType: VerifierType;
// }

export const MinaContext = createContext<StoreApi<MinaStore> | null>(null);

export function MinaProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<MinaStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createMinaStore();
  }

  return (
    <MinaContext.Provider value={storeRef.current}>
      {children}
    </MinaContext.Provider>
  );
}

export const useMinaStore = <T,>(selector: (store: MinaStore) => T) => {
  const store = useContext(MinaContext);
  if (!store)
    throw new Error("useMinaStore must be used within a MinaProvider");
  return useStore(store, selector);
};
