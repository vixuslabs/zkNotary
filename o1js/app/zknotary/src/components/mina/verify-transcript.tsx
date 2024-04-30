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

        return (
          <span>
            `Transaction sent! Find it on minascan{" "}
            <a href={tx.transactionLink}>${tx.transactionLink} </a>`
          </span>
        );
      },
      error: (err) => {
        console.error(err);
        return err.message;
      },
    });

    console.log("validSig", validSig.toBoolean());
  }, []);

  const verifyProofLocally = useCallback(async () => {
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

    let validSig = signature.verify(notaryPubKey, sessionHeader.toFields());

    const isValid = validSig.toBoolean();

    if (isValid) {
      toast.success("Proof is valid!");
    } else {
      toast.error("Proof is invalid!");
    }
  }, []);

  return (
    <section className="flex flex-col items-center justify-center py-12">
      <h2 className="text-xl font-bold tracking-tight text-center sm:text-2xl">
        Now it is time to verify the SessionHeader of our retrieved proof!
      </h2>
      <div className="mt-8 flex gap-4">
        <Button disabled={creatingTransaction} onClick={verifyProofLocally}>
          Verify Locally
        </Button>
        <Button disabled={creatingTransaction} onClick={handleVerifyProof}>
          Verify on Chain
        </Button>
      </div>
    </section>
  );
}
