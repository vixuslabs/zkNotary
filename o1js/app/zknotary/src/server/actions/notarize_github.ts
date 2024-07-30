"use server";

// Github notarization

import { RootSchemaValuesType } from "@/lib/proof_types";

export type ServiceNames = "github" | "etherscan";

export type NotaryGithubArgs = {
  username: string;
  repo: string;
  since: Date;
  until: Date;
};

const NOTARY_SERVER_HOST = "127.0.0.1";
const NOTARY_SERVER_PORT = 8080;

export async function notarize_github(args: NotaryGithubArgs) {
  let { username, repo, since, until } = args;

  let url = `http://${NOTARY_SERVER_HOST}:${NOTARY_SERVER_PORT}/notarize_github?username=${username}&repo=${repo}&since=${since.toISOString()}&until=${until.toISOString()}`;

  let response = await fetch(url);

  let jsonData = (await response.json()) as RootSchemaValuesType;

  return {
    data: jsonData,
  };
}
