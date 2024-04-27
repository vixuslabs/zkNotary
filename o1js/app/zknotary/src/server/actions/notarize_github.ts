"use server";

// Github notarization

import { RootSchema } from "@/lib/proof_types";

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

  let jsonData = await response.json();

  console.log("jsonData", jsonData);

  // const parsedData = JSON.parse(jsonData);:

  // Validate the parsed data using Zod
  // const result = RootSchema.safeParse(jsonData);

  // const normalResult = RootSchema.parse(jsonData);
  //
  // console.log("normalResult", normalResult);

  // console.log(result);

  return {
    data: jsonData,
  };

  // if (!result.success) {
  //   console.error("zod errror", result.error);
  //   console.warn("Returning response.data()");
  //   return {
  //     data: jsonData,
  //   };
  //
  //   // throw new Error("Invalid data received from server");
  // } else {
  //   return result;
  // }
}
