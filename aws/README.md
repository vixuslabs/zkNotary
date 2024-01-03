# AWS Deployment

This directory contains the script for deploying the TLS Notary Server on AWS.

## Prerequisites

- Node.js
- AWS SDK for JavaScript

## File Structure

- `aws_deploy.js`: This is the main script that handles the deployment of the TLS Notary Server on AWS.

## Usage

1. Configure your AWS credentials. You can do this by setting the following environment variables:

   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

2. Run the deployment script:

```sh
node aws_deploy.js
```

This script will create a new EC2 instance, configure it, and deploy the TLS Notary Server on it.

## AWS Configuration

The script uses the following AWS services:

- EC2: For creating and managing the server instance.

The script is configured to use the us-east-1 region. If you want to use a different region, you can change it in the EC2Client configuration in the aws_deploy.js file.

## Troubleshooting

If the deployment fails, the error will be logged to the console. Check the error message for details about what went wrong.

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes you want to make.

## License

MIT
