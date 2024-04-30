"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type ZkappWorkerClient from "./zkappWorkerClient";
import type { PublicKey as PublicKeyType } from "o1js";

let transactionFee = 0.1;
const ZKAPP_ADDRESS = "B62qnHwMLgLE7dcVRGhrdgttSAynzuqHyoacYYtCP7ZM68TWgjDiUhN"; //devnet01

export interface TlsnVerifierContext {
  zkappWorkerClient: ZkappWorkerClient | null;
  hasWallet: boolean | null;
  hasBeenSetup: boolean;
  accountExists: boolean;
  notaryPublicKey: PublicKeyType | null;
  publicKey: PublicKeyType | null;
  zkappPublicKey: PublicKeyType | null;
  creatingTransaction: boolean;
}
export type SendTransactionResult = {
  transactionLink: string;
  hash: string;
};

export interface TlsnVerifierActions extends TlsnVerifierContext {
  sendTransaction: (proof: string) => Promise<SendTransactionResult>;
}

const TlsnVerifierContext = createContext<TlsnVerifierActions>({
  zkappWorkerClient: null,
  hasWallet: null,
  hasBeenSetup: false,
  accountExists: false,
  notaryPublicKey: null,
  publicKey: null,
  zkappPublicKey: null,
  creatingTransaction: false,
  sendTransaction: async () => {
    throw new Error("onSendTransaction not implemented");
  },
});

export const useTlsnVerifier = () => {
  const context = useContext(TlsnVerifierContext);

  if (context === undefined) {
    throw new Error(
      "useTlsnVerifier must be used within a TlsnVerifierProvider"
    );
  }

  return context;
};

export default function TlsnVerifierProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<TlsnVerifierContext>({
    zkappWorkerClient: null,
    hasWallet: null,
    hasBeenSetup: false,
    accountExists: false,
    notaryPublicKey: null,
    publicKey: null,
    zkappPublicKey: null,
    creatingTransaction: false,
  });

  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!state.hasBeenSetup) {
        const { PublicKey } = await import("o1js");
        const ZkappWorkerClient = (await import("./zkappWorkerClient")).default;

        try {
          console.log("Loading web worker...");
          const zkappWorkerClient = new ZkappWorkerClient();
          await timeout(5);

          console.log("Done loading web worker");

          await zkappWorkerClient.setActiveInstanceToDevnet();

          const mina = (window as any).mina;

          if (mina == null) {
            setState({ ...state, hasWallet: false });
            return;
          }

          const publicKeyBase58: string = (await mina.requestAccounts())[0];
          const publicKey = PublicKey.fromBase58(publicKeyBase58);

          console.log(`Using key:${publicKey.toBase58()}`);
          console.log("Checking if fee payer account exists...");

          const res = await zkappWorkerClient.fetchAccount({
            publicKey: publicKey!,
          });
          const accountExists = res.error == null;

          await zkappWorkerClient.loadContract();

          console.log("Compiling zkApp...");
          await zkappWorkerClient.compileContract();
          console.log("zkApp compiled");

          const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

          await zkappWorkerClient.initZkappInstance(zkappPublicKey);

          console.log("Getting zkApp state...");

          await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
          const notaryPublicKey = await zkappWorkerClient.getNotaryPublicKey();

          console.log(`Current state in zkApp: ${notaryPublicKey.toBase58()}`);

          setState({
            ...state,
            zkappWorkerClient,
            hasWallet: true,
            hasBeenSetup: true,
            publicKey,
            zkappPublicKey,
            accountExists,
            notaryPublicKey,
          });
        } catch (e) {
          console.error(e);
          setState({ ...state, creatingTransaction: false });
          throw new Error("Error setting up TLSN verifier");
        }
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  // useEffect(() => {
  //   (async () => {
  //     if (state.hasBeenSetup && !state.accountExists) {
  //       for (;;) {
  //         setDisplayText("Checking if fee payer account exists...");
  //         console.log("Checking if fee payer account exists...");
  //         const res = await state.zkappWorkerClient!.fetchAccount({
  //           publicKey: state.publicKey!,
  //         });
  //         const accountExists = res.error == null;
  //         if (accountExists) {
  //           break;
  //         }
  //         await new Promise((resolve) => setTimeout(resolve, 5000));
  //       }
  //       setState({ ...state, accountExists: true });
  //     }
  //   })();
  // }, [state.hasBeenSetup]);

  // -------------------------------------------------------
  // Send a transaction

  const sendTransaction = async (
    proof: string
  ): Promise<SendTransactionResult> => {
    setState({ ...state, creatingTransaction: true });

    console.log("Creating a transaction...");

    console.log("state", state);

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    await state.zkappWorkerClient!.createVerifySignatureTransaction(proof);

    console.log("Creating proof...");
    await state.zkappWorkerClient!.proveUpdateTransaction();

    console.log("Requesting send transaction...");
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    console.log("Getting transaction JSON...");
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: "",
      },
    });

    const transactionLink = `https://devnet.minaexplorer.com/transaction/${hash}`;
    console.log(`View transaction at ${transactionLink}`);

    setState({ ...state, creatingTransaction: false });

    return { transactionLink, hash };
  };

  const value = useMemo(() => {
    return {
      ...state,
      sendTransaction,
    };
  }, [state]);

  return (
    <TlsnVerifierContext.Provider value={value}>
      {children}
    </TlsnVerifierContext.Provider>
  );
}
