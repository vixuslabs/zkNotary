"use client";

import React, { useCallback, useEffect, useState } from "react";

import { NOTARY_PUB_KEY } from "@/lib/constants";

import { useMinaStore } from "@/components/providers/mina-provider";
import { useExamplesStore } from "@/components/providers/examples-provider";

import { Button } from "@/components/ui/button";
import { useTlsnVerifier } from "@/mina/tlsn-verifier-provider";
import { toast } from "sonner";

export default function VerifyTranscript() {
  const { active, proofData } = useExamplesStore((state) => state);
  const [compilingContract, setCompilingContract] = useState(false);

  const { setPendingTransaction, hasPendingTransaction } = useMinaStore(
    (state) => state
  );
  const {
    sendTransaction,
    handleCompileContract,
    hasBeenSetup,
    zkappWorkerClient,
  } = useTlsnVerifier();

  const compileContract = useCallback(async () => {
    setCompilingContract(true);

    toast.promise(handleCompileContract, {
      loading: "Compiling Contract...",
      success: () => {
        setCompilingContract(false);
        return "Contract compiled successfully!";
      },
      error: (err) => {
        setCompilingContract(false);
        return err.message;
      },
    });

    setCompilingContract(false);
  }, [hasBeenSetup]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofData) {
      console.log("proofData is null");
      return;
    }

    if (active === null) {
      console.log("active is null");
      return;
    }

    let limitedProof = {
      session: {
        header: proofData[active]!.session.header,
        signature: proofData[active]!.session.signature,
      },
    };

    if (!zkappWorkerClient) {
      console.log("zkappWorkerClient is null");
      return;
    }

    let txProof = JSON.stringify(limitedProof);

    try {
      let sendSigTx = async () => {
        return await sendTransaction(txProof, zkappWorkerClient);
      };

      setPendingTransaction(true);

      toast.promise(sendSigTx, {
        loading: "Sending Transaction",
        success: (tx) => {
          setPendingTransaction(false);

          return (
            <span>
              Transaction sent! Find it on minascan:{" "}
              <a
                className="inline-block underline underline-offset-2"
                href={tx.transactionLink}
              >
                here
              </a>
            </span>
          );
        },
        error: (err) => {
          setPendingTransaction(false);
          return err.message;
        },
        duration: 10000,
        dismissible: true,
      });
    } catch (err: any) {
      setPendingTransaction(false);
      toast.error("Failed to send transaction");
    }
  }, [zkappWorkerClient]);

  const verifyProofLocally = useCallback(async () => {
    let { PublicKey } = await import("o1js");
    let { SessionHeader } = await import("@zknotary/contracts");

    setPendingTransaction(true);

    if (!proofData) {
      return;
    }

    if (active === null) {
      return;
    }

    // const makeInvalid = process.env.NODE_ENV === "development";
    // const makeInvalid = false;

    // const forceInvalid = { ...proofData[active]!.session.header };

    // forceInvalid.recv_len = 123;

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
      setPendingTransaction(false);
      toast.success("Proof is valid!");
    } else {
      setPendingTransaction(false);
      toast.error("Proof is invalid!");
    }
  }, [proofData.github, proofData.etherscan, active, zkappWorkerClient]);

  return (
    <section className="flex flex-col items-center justify-center py-12">
      <h2 className="text-lg font-semibold  text-center">
        Now we can verify the session&apos;s header from our retrieved proof! 🎉
      </h2>
      <p className="mt-4 text-center max-w-[50%]">
        You can verify the proof locally and through the zkApp contract
        on-chain.
      </p>
      <div className="mt-8 flex gap-4">
        <Button disabled={hasPendingTransaction} onClick={verifyProofLocally}>
          Verify Locally
        </Button>

        {!hasBeenSetup ? (
          <Button disabled={compilingContract} onClick={compileContract}>
            Compile Contract
          </Button>
        ) : (
          <Button disabled={hasPendingTransaction} onClick={handleVerifyProof}>
            Verify on Chain
          </Button>
        )}
      </div>
    </section>
  );
}
