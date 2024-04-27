import { ActiveContent } from "@/components/examples-store";

export const homeContent: ActiveContent = {
  title: "Welcome to zkNotary!",
  description:
    "This website is meant to demonstrate how you can utilize zkNotary to autenticate retreived data from various sources.",
  instructions: [
    "Create an account by clicking the 'Sign Up' button in the top right corner.",
    "Once you've created your account, you'll be able to access the dashboard and all of our features.",
    "To get started, navigate to the 'Projects' section and create a new project.",
    "From there, you can add team members, set up integrations, and start building your application.",
  ],
};

export const etherscanContent: ActiveContent = {
  title: "Etherscan",
  description:
    "This example will show you how you can hit the Etherscan API to retrieve data from the Ethereum blockchain, particularly in our example, to see how many ERC-20 tokens a certain address has in their wallet.",
  instructions: [
    "Enter the contract address of the ERC-20 token you want to query.",
    "Enter the address of the wallet you want to query.",
    "Click the 'Notarize' button to see the results.",
  ],
};

export const githubContent: ActiveContent = {
  title: "GitHub",
  description:
    "This example will show you how you can hit the GitHub API to retrieve the commit history from a specific repository.",
  instructions: [
    "Enter the GitHub username associated with the repository.",
    "Enter the name of the repository you want to notarize.",
    "Select the start date for the notarization period.",
    "Click the 'Notarize' button to see the results.",
  ],
};
