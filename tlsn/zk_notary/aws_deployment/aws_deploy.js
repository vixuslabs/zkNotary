import { EC2Client, RunInstancesCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { exec } from 'child_process';

// Configure AWS
const ec2Client = new EC2Client({ region: "us-east-1" }); // Update the region

async function deployTLSNotaryServer() {
  const instanceParams = {
    ImageId: "ami-0fc5d935ebf8bc3bc", // Replace with the AMI ID you want to use
    InstanceType: "t2.micro",        // Specify the instance type
    KeyName: "zknotary",          // Your SSH key pair name
    SecurityGroupIds: ["sg-017f77fdb7de58e8a"], // Security Group ID
    MinCount: 1,
    MaxCount: 1,
    // Other configurations like block device mappings, IAM roles, etc.
};


    // const runCommand = new RunInstancesCommand(instanceParams);
    // const instanceResponse = await ec2Client.send(runCommand);
    // const instanceId = instanceResponse.Instances[0].InstanceId;

    // await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for instance to initialize

    // const describeCommand = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
    // const describeResponse = await ec2Client.send(describeCommand);
    // const publicDNS = describeResponse.Reservations[0].Instances[0].PublicDnsName;
    const publicDNS = "ec2-54-83-100-219.compute-1.amazonaws.com"

    const setupCommands = `
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source $HOME/.cargo/env
        git clone https://github.com/tlsnotary/tlsn.git
        cd tlsn/notary-server
        cargo run --release
    `;

    exec(`ssh -i ~/.ssh/zknotary.pem -o StrictHostKeyChecking=no ubuntu@${publicDNS} '${setupCommands}'`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        console.log(`STDOUT: ${stdout}`);
        console.error(`STDERR: ${stderr}`);
    });
}

deployTLSNotaryServer().catch((error) => {
    console.error("Deployment failed:", error);
});
