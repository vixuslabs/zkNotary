import type { Mina } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

import type { TlsnVerifier } from "@zknotary/contracts";

const state = {
  TlsnVerifier: null as null | typeof TlsnVerifier,
  zkapp: null as null | TlsnVerifier,
  transaction: null as null | Transaction,
};

const functions = {
  setActiveInstanceToDevnet: async () => {
    const { Mina } = await import("o1js");
    const Berkeley = Mina.Network(
      "https://api.minascan.io/node/devnet/v1/graphql"
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async () => {
    const { TlsnVerifier } = await import("@zknotary/contracts");
    state.TlsnVerifier = TlsnVerifier;
  },
  compileContract: async () => {
    await state.TlsnVerifier!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const { PublicKey, fetchAccount } = await import("o1js");
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const { PublicKey } = await import("o1js");
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.TlsnVerifier!(publicKey);
  },
  getNotaryPublicKey: async () => {
    const notaryPublicKey = await state.zkapp!.notaryPublicKey.get();
    console.log("notaryPublickKey: ", notaryPublicKey.toBase58());
    return notaryPublicKey.toBase58();
  },
  createVerifySignatureTransaction: async (args: { proof: string }) => {
    const { Mina } = await import("o1js");
    const { SessionHeader } = await import("@zknotary/contracts");
    const [sessionHeader, signature] = SessionHeader.fromJson(args.proof);
    const transaction = await Mina.transaction(async () => {
      await state.zkapp!.verify(sessionHeader, signature);
    });
    state.transaction = transaction;
  },
  proveUpdateTransaction: async () => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async () => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );

  window.onbeforeunload = () => {
    console.log("Web Worker Terminated.");
  };
}

console.log("Web Worker Successfully Initialized.");
