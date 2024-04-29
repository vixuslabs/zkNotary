"use server";

import { RootSchemaSuccessType, RootSchemaValuesType } from "@/lib/proof_types";

// Etherscan notarization

export type ServiceNames = "github" | "etherscan";

export type NotaryEtherscanArgs = {
  contractAddress: string;
  address: string;
};

interface ReturnedDevNotarization {
  proof: RootSchemaSuccessType;
  readable_proof: string;
}

//const NOTARY_SERVER_HOST = process.env.NOTARY_PROVER_HOST!;
const NOTARY_SERVER_HOST = "127.0.0.1";
const NOTARY_SERVER_PORT = 8080;

export async function notarize_etherscan(args: NotaryEtherscanArgs) {
  let { contractAddress, address } = args;

  let url = `http://${NOTARY_SERVER_HOST}:${NOTARY_SERVER_PORT}/notarize_etherscan?contract_address=${contractAddress}&address=${address}`;

  let response = await fetch(url);

  console.log(response);

  let jsonData = (await response.json()) as RootSchemaValuesType;

  return {
    data: jsonData,
  };
}

// function cleanAndParseRawData(rawData: string): string {
//   // Remove escape characters
//   let cleanedData = rawData.replace(/\\r/g, "");
//   cleanedData = cleanedData.replace(/\\n/g, "\n");
//
//   // Replace escaped double quotes with normal double quotes
//   cleanedData = cleanedData.replace(/\\"/g, '"');
//
//   return cleanedData;
// }
