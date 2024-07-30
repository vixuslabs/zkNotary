"use server";

// Etherscan notarization

import { RootSchemaValuesType } from "@/lib/proof_types";

export type ServiceNames = "github" | "etherscan";

export type NotaryEtherscanArgs = {
  contractAddress: string;
  address: string;
};

//const NOTARY_SERVER_HOST = process.env.NOTARY_PROVER_HOST!;
const NOTARY_SERVER_HOST = "127.0.0.1";
const NOTARY_SERVER_PORT = 8080;

export async function notarize_etherscan(args: NotaryEtherscanArgs) {
  let { contractAddress, address } = args;

  let url = `http://${NOTARY_SERVER_HOST}:${NOTARY_SERVER_PORT}/notarize_etherscan?contract_address=${contractAddress}&address=${address}`;

  let response = await fetch(url);

  let jsonData = (await response.json()) as RootSchemaValuesType;

  // console.log("jsonData", jsonData);

  return {
    data: jsonData,
  };
}
