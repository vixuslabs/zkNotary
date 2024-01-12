# AWS Deployment Utility for the Notary Server

This README provides a comprehensive guide on using the AWS Deployment Utility script for deploying the TLSNotary Server on AWS infrastructure. This utility is especially useful for zkApp developers who wish to deploy their application in a production environment.

## Overview

The AWS Deployment Utility script is designed to automate the deployment of a TLSNotary Server on an AWS EC2 instance. This script handles various tasks, including the creation of an EC2 instance, installation of necessary dependencies, and running the Notary Server.

## Prerequisites

Before running this script, ensure you have the following:

1. **AWS Account**: An active AWS account and appropriate permissions to create and manage EC2 instances.
2. **AWS SDK for JavaScript**: Ensure the AWS SDK for JavaScript is installed and configured correctly in your environment.
3. **SSH Key**: The script assumes you have an SSH key named `zknotary` in your AWS account and locally under `~/.ssh/zknotary.pem`. Make sure this key exists, or modify the script to use a key of your choice.

## Script Breakdown

- **EC2 Client Configuration**: The script sets up an EC2 client targeting the `us-east-1` region.
- **Instance Creation**: It deploys a `t2.micro` instance using the specified AMI, key name, and security group.
- **Instance Initialization**: After creating the instance, the script waits for 60 seconds to allow the instance to initialize.
- **Setup Commands**: The script executes a series of commands on the newly created instance. These commands include setting up a DNS resolver, installing Rust, cloning the TLSNotary repository, and running the Notary Server.
- **SSH Execution**: It uses SSH to run the setup commands on the EC2 instance.

## Running the Script

To run the script, simply execute it in your JavaScript environment. The script will log outputs to the console, which includes any standard output or errors encountered during the deployment process.

### Command to Run

```bash
node aws-deployment-script.js
```

## Troubleshooting

If the deployment fails, check the following:

- AWS Credentials: Ensure your AWS credentials are set up correctly and have the necessary permissions.
- SSH Key: Verify that the SSH key is correctly set up both in AWS and locally.
- Network Accessibility: Ensure that the security group and network configurations allow SSH access to the EC2 instance.

**Note**: This script is intended for production deployment. For development purposes, you may want to consider simpler alternatives, like cloning the TLSNotary repository and running the [Notary Server](https://github.com/tlsnotary/tlsn/tree/dev/notary-server).

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes you want to make.

## License

Apache
