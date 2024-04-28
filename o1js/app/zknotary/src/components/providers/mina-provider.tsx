"use client";

import React from "react";

import { TlsnVerifier } from "@zknotary/contracts";

import { SessionHeader } from "@zknotary/contracts/build/src/SessionHeader";

type VerifierType = "standalone" | "blockchain";

export interface MinaProviderProps {
  initialized: boolean;
  verifier: TlsnVerifier;
  verifierType: VerifierType;
}

import type { RootSchemaSuccessType } from "@/lib/proof_types";

const TLSN_PUB_KEY = "B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws";

export default function MinaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = React.useState(false);
  const [verifier, setVerifier] = React.useState<TlsnVerifier | null>(null);
  //
  // React.useEffect(() => {
  //   if (!initialized) {
  //     const tlsnVerifier = new TlsnVerifier(TLSN_PUB_KEY);
  //     setVerifier(tlsnVerifier);
  //     setInitialized(true);
  //   }
  // }, [initialized]);

  const validateData = (jsonData: string) => {
    // just pass in the header
    const [sessionHeader, signature] = SessionHeader.fromJSON(jsonData);
  };

  return (
    <MinaContext.Provider value={{ initialized, verifier }}>
      {children}
    </MinaContext.Provider>
  );
}
