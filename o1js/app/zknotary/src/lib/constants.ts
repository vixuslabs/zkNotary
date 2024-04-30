import { ActiveContent } from "@/stores/examples-store";

export const NOTARY_PUB_KEY =
  "B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws";

export const homeContent: ActiveContent = {
  title: "Welcome to zkNotary!",
  description:
    "This website is meant to demonstrate how you can utilize TLS Notary to notarize data retrieved from various sample APIs. Just select an example from the dropdown menu, where you can choose between Etherscan and GitHub. Here's how what's going on under the hood:",
  instructions: [
    "This web application queries a backend service that executes a custom TLS Notary prover, depending wether you chose Github or Etherscan.",
    "The prover generates and signs a proof that the data you requested was indeed retrieved from the chosen API.",
    "A Mina smart contract verifies the signature of the TLS Notary proof and then sends the corresponding Mina proof to the blockchain.",
    "The Mina proof is then used to verify the TLS Notary proof, which in turn verifies the data retrieved from the API.",
    "The result is displayed on the screen, showing the data retrieved from the API and the verification status of the proof.",
  ],
};

export const etherscanContent: ActiveContent = {
  title: "Etherscan",
  description:
    "This example will show you how you can use TLS Notary to notarize data from the Ethereum blockchain, using the Etherscan API. Particularly in this example, we retrieve how many tokens for a given ERC-20 contract a certain address has in its wallet.",
  instructions: [
    "Enter the contract address of the ERC-20 token you want to query.",
    "Enter the address of the wallet you want to query.",
    "Click the 'Notarize' button to see the results.",
  ],
};

export const githubContent: ActiveContent = {
  title: "GitHub",
  description:
    "This example will show you how you can use TLS Notary to notarize the commit history for a specific user from a given Github repository.",
  instructions: [
    "Enter the GitHub username of the user you want to retrieve the commits for.",
    "Enter the name of the repository.",
    "Select the start and end dates for the notarization.",
    "Click the 'Notarize' button to see the results.",
  ],
};
