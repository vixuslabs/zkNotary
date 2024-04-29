"use client";

import React, { useCallback } from "react";

import { NOTARY_PUB_KEY } from "@/lib/constants";

import { useMinaStore } from "@/components/providers/mina-provider";
import { useExamplesStore } from "@/components/providers/examples-provider";

import { Button } from "@/components/ui/button";

export default function VerifyTranscript() {
  const { active, proofData, verifiedData } = useExamplesStore(
    (state) => state
  );
  const { wallet, setPendingTransaction } = useMinaStore((state) => state);

  const handleVerifyProof = useCallback(async () => {
    let { PublicKey } = await import("o1js");
    let { SessionHeader } = await import("@zknotary/contracts");

    if (!proofData) {
      return;
    }

    if (active === null) {
      return;
    }

    let limitedProof = {
      session: {
        header: proofData[active]!.session.header,
        signature: proofData[active]!.session.signature,
      },
    };

    let proof = JSON.stringify(limitedProof);

    let [sessionHeader, signature] = SessionHeader.fromJson(proof);

    let notaryPubKey = PublicKey.fromBase58(NOTARY_PUB_KEY);
    //
    // console.log("sessionHeader", sessionHeader);
    // console.log("signature", signature);
    // console.log("notaryPubKey", notaryPubKey);
    //
    let validSig = signature.verify(notaryPubKey, sessionHeader.toFields());
    //
    console.log("validSig", validSig.toBoolean());
  }, []);

  return <Button onClick={handleVerifyProof}>Verify Transcript</Button>;
}
