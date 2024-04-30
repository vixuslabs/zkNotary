"use client";

import React, { useCallback } from "react";

import { NOTARY_PUB_KEY } from "@/lib/constants";

import { useMinaStore } from "@/components/providers/mina-provider";
import { useExamplesStore } from "@/components/providers/examples-provider";

import { Button } from "@/components/ui/button";
import { useTlsnVerifier } from "@/mina/tlsn-verifier-provider";
import { toast } from "sonner";

export default function VerifyTranscript() {
  const { active, proofData, verifiedData } = useExamplesStore(
    (state) => state
  );

  const { wallet, setPendingTransaction } = useMinaStore((state) => state);
  const { sendTransaction, creatingTransaction } = useTlsnVerifier();

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

    console.log("validSig", validSig.toBoolean());

    let txProof = JSON.stringify(limitedProof);

    console.log("txProof", txProof);

    let sendSigTx = async () => {
      return await sendTransaction(txProof);
    };

    toast.promise(sendSigTx, {
      loading: "Sending Transaction",
      success: (tx) => {
        console.log("tx", tx);

        return `Transaction sent! Find it on minascan: ${tx.transactionLink}`;
      },
      error: (err) => {
        console.error(err);
        return err.message;
      },
    });

    console.log("validSig", validSig.toBoolean());
  }, []);

  return (
    <Button disabled={creatingTransaction} onClick={handleVerifyProof}>
      Verify Transcript
    </Button>
  );
}
