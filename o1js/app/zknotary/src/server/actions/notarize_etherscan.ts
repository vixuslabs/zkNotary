"use server";

// Etherscan notarization

import { z } from "zod";

import { RootSchema } from "@/lib/proof_types";

export type ServiceNames = "github" | "etherscan";

export type NotaryEtherscanArgs = {
  contractAddress: string;
  address: string;
};

const NOTARY_SERVER_HOST = "127.0.0.1";
const NOTARY_SERVER_PORT = 8080;

export async function notarize_etherscan(args: NotaryEtherscanArgs) {
  let { contractAddress, address } = args;

  let url = `http://${NOTARY_SERVER_HOST}:${NOTARY_SERVER_PORT}/notarize_etherscan?contract_address=${contractAddress}&address=${address}`;

  let response = await fetch(url);

  console.log(response);

  let jsonData = await response.json();

  console.log(jsonData);

  const parsedData = JSON.parse(jsonData);

  // Validate the parsed data using Zod
  const result = RootSchema.safeParse(parsedData);

  if (!result.success) {
    throw new Error("Invalid data received from server");
  } else {
    return result;
  }
}
