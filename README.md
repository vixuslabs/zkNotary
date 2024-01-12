# zkNotary: a zkOracle for Mina powered by TLSNotary

## Introduction

In today's Internet, private data from HTTPS-based REST APIs can be securely accessed thanks to technologies like TLS. However, proving the origin of such data to third parties is still a significant challenge. This limitation confines the value of the data to its original source, preventing it from being exported to other applications with preserved integrity.

This is where the open source project [TLSNotary](https://tlsnotary.org) provides an elegant solution by dividing TLS session keys between the TLS client and a Notary, through a two-party computation (2PC).

We propose zkNotary, a zkOracle for Mina based on TLSNotary as its core component. zkNotary will enable anyone to create cryptographic proofs of authenticity that prove that some data accessed via TLS genuinely originated from a specific REST API, providing the Mina community with a powerful cryptographic primitive that will open the door to countless applications in the ZK space.

## Problem statement

Currently, there is no oracle solution for Mina that can retrieve data from an HTTPS server while providing all of the following properties:

1. Data provenance verification
2. Data integrity guarantee
3. Data privacy preservation
4. No trust assumptions
5. No server-side modifications

While working on my zkIgnite Cohort 1 project, ["Cryptographic Proof of NFT Endorsement" (CPoNE)](https://github.com/racampos/cpone), I realized that my project heavily relied on a trustless method for data retrieval. Specifically, I needed to retrieve data from the Twitter API to feed into a Mina zkApp, which would verify that the data retrieved from Twitter matched a set of previously committed data, i.e., a Twitter handle and specific NFT metadata.

After spending several weeks studying the theory behind TLS and current attempts at solving this problem, I realized that this was a substantial undertaking. Consequently, I decided to defer the development of a truly trustless zkOracle for a future cohort.

Like me, many zkApp developers are trying to develop applications that rely on trusted data from external sources. Without a reliable zkOracle to facilitate this, the data fed into their zkApps would lack a solid foundation of authenticity. This is similar to how my CPoNE project lacks authenticity due to the inability to prove, in a trustless way, that the data was retrieved from Twitter.

A solution to this problem would provide the Mina community of zkApp developers with a highly useful and needed cryptographic primitive. This will enable them to create zk applications that use data from the outside world in a private and trustless manner.

## Solution

Solutions to this problem have already been proposed and implemented by projects such as [TLSNotary](https://tlsnotary.org) and [DECO](https://www.deco.works). Both of these projects use the same approach, which consists of splitting the client's TLS session keys between two parties, a User and a Notary, through secure two-party computation (2PC). During the protocol, neither the User nor the Notary possess the full TLS session keys; instead, they each hold a share of those keys. This arrangement makes it impossible for the User to forge any data.

Since TLSNotary is an open-source project, zkNotary focuses on using it as its core component. We aimed to create a user-friendly layer specially designed for Mina zkApp developers, making it simple to add a zkOracle to any zkApp architecture.

Given the limited timeframe (three months) available for the development of this project, we have constrained zkNotary's scope to retrieving and authenticating data from RESTful APIs only, not generic websites. While this approach is somewhat limiting, we believe it addresses the needs of most zkApp developers.

Our goal has been to provide the Mina community with an easy-to-use building block that can be incorporated into any zkApp architecture, without the need for developers to understand the complexities of the TLS protocol or the inner workings of TLSNotary.

## A TLSNotary Primer

In order to understand zkNotary's architecture and design choices, it's important to first understand the basics of how TLSNotary works. Following is a quick overview of the most important aspects.

### TLS 101

The TLS protocol allows an HTTP client (Alice) to exchange data securely with a web server. TLS does this by providing data privacy and data integrity to the communication between Alice and the server. Data privacy means that the data is encrypted and only Alice is able to decrypt it. Data integrity means that Alice can be certain that the data has not been tampered with.

<img alt="what-is-tlsnotary-1" src="docs/img/what-is-tlsnotary-1.png" width="500">

### The Data Portability Problem

Now let's see what happens when Alice needs to share the data she retrieved from the web server with a third party (Bob). In this case, Bob can't use the data without having to trust that Alice didn't modify it. This can be summarized as the data not being "portable".

<img alt="what-is-tlsnotary-2" src="docs/img/what-is-tlsnotary-2.png" width="500">

The reason for this lack of portability is simple: the encryption and signing keys from the TLS session between Alice and the web server are shared keys, which means that they are the same for both Alice and the server. So, if Alice knows the keys, nothing prevents her from changing the data and then re-signing it before forwarding it to Bob.

### TLSNotary to the Rescue

TLSNotary was introduced to solve this portability problem. If only we could, somehow, prevent Alice from having access to the TLS session keys, she would not be able to tamper with the data and Bob would be certain of the data's integrity. This is exactly what TLSNotary does, thus making the data portable.

<img alt="what-is-tlsnotary-3" src="docs/img/what-is-tlsnotary-3.png" width="500">

### TLSNotary's Secret Sauce

But, how exactly does TLSNotary prevent Alice from having access to the keys? After all, being the HTTP client, Alice definitely needs to negotiate the TLS session keys with the server in order to exchange data?

To solve this problem, TLSNotary introduces a novel idea: to bring in a new participant called a "Notary" that, along with Alice, performs the negotiation of the session keys with the server using MultiParty Computation (MPC). This way, neither Alice nor the Notary has the whole keys, but only a share of them, thus preventing Alice from signing the data herself.

<img alt="how-does-tlsnotary-work-1" src="docs/img/how-does-tlsnotary-work-1.png" width="500">

### TLSNotary Features

- #### No need for cooperation from the web server

  Because everything happens on the client side, from the web server's point of view, the interaction with the Alice-Notary bundle is no different from an interaction with any other standard HTTP client. This means that TLSNotary doesn't require the web server to cooperate in any way.

- #### Selective Disclosure

  Alice can redact part of the data before sending it to Bob, so that she doesn't disclose sensitive information.

- #### General-purpose Notary Server

  The Notary never learns anything about the data that's being notarized, not even the web server's identity. This allows the Notary to be run as a general-purpose server, to be used by anyone who needs to notarize data to make it portable.

### TLSNotary's Trust Assumptions

Even though Bob doesn't need to trust Alice anymore, he does need to trust the Notary. This is because there's the possibility of the Notary colluding with Alice in order to modify the data and mislead Bob into accepting it as original.

There are some ways to minimize this trust assumption. For example, given that the Notary is a general-purpose server, Bob could require notarizations from serveral independent Notaries before accepting the data as valid. Another possibility is for Bob to act as the Notary by running the notary server software himself. This would eliminate all trust assumptions.

## Implementation

The project is divided into four main components:

1. ### The Prover

This component is at the heart of zkNotary. It is the one responsible for performing the multiparty computation along with the Notary to establish an MPC TLS session with the web server and generating the session notarization and corresponding proof.

It has been implemented as a REST API written in Rust (as the TLSNotary is itself written in Rust). The REST API exposes a series of endpoints, each one for a different web server (Twitter, Discord, etc). The idea behind implementing it as a REST API is to abstract away from the zkApp developer the complexities of compiling and running Rust code.

The complete source code and documentation for this component can be found [under the `provers` directory](./provers).

2. ### The Verifier

This component facilitates the verification of a proof of notarization generated by TLSNotary from within a Javascript application.

The code is written in Rust but it has been compiled to Web Assembly, which in turn has been used to create an NPM package (using the [wasm-pack](https://rustwasm.github.io/docs/wasm-pack/introduction.html) project), that can be imported into any Javascript application. The NPM package has been published to the NPM Registry as `zknotary-verifier`.

The complete source code and documentation for this component can be found [under the `verifier` directory](./verifier).

3. ### The Parser

This component contains a set of utilities to help the developer correctly parse the output of the verifier component.

If the proof is valid, the verifier's output consists of the original notarization of the TLS session created by TLSNotary. This notarization is made up of unstructured text that varies significantly depending on the type of data that was notarized in the first place. To help developers more easily process the verifier's output, we have created a set of application-specific parsers.

For the time being, only the parser for Twitter has been included, but more will be added later on for services like Facebook, Reddit and others.

The complete source code and documentation for this component can be found [under the `parsers` directory](./parsers).

4. ### The AWS deployment utility

For the Prover to perform its job, a Notary Server has to be running somewhere. For developing purposes the developer can just clone the [TLSNotary Github repo](https://github.com/tlsnotary/tlsn) and then build and run the Notary Server. But for a production application, the Notary Server has to be deployed on public infrastructure that is reachable by the Prover.

In order to make it easier for a zkApp developer to do this on AWS, we have included a deployment script written in Javascript that performs all the tasks associated with the deployment of a server on AWS: create an EC2 instance from a Linux image, install Rust, clone the TLSNotary Github repo, build and finally run the Notary Server.

## General Architecture

In order to better understand the overall architecture of the project, we have designed the following diagram, which illustrates the flow and interrelationships between the different components. We use Twitter as an example, but the workflow is the same with any other service:

<img alt="general-architecture" src="docs/img/general-architecture.png" width="700">

Here is a breakdown of each of the steps involved in the process:

- **Step 1**: Alice calls the zkNotary Prover REST API with the tweet's URL as a querystring argument.

  ```
  GET /notarize_twitter?tweet_url=https://twitter.com/mathy782/status/1670919907687505920
  ```

  This is the tweet that is being notarized for this example:

  <img alt="notarized_tweet" src="docs/img/notarized_tweet.png" width="400">

- **Step 2**: The zkNotary Prover and the Notary Server use MPC to create a joint TLS session with the Twitter API and retrieve the tweet's data.

- **Step 3**: After closing the TLS session with Twitter, the Notary Server executes the notarization of the TLS session and signs it with its private key.

- **Step 4**: The Prover REST API replies to Alice with a JSON object containing the signed notarization of the TLS session with the Twitter server as well as the corresponding proof generated by the Notary Server.

- **Step 5**: Alice sends the signed notarized session and the proof to Bob. In order to verify it by himself, he uses the `verify()` function from the [`zknotary-verifier`](./verifier) npm package. This function takes as input the proof and the Notary Server's public key and returns a plain text file containing the transcript from the TLS session.

  **Note**: Given that the verifier's output is a plain text file, in order for Bob to make sense of it and extract the important information (in our example, the tweet's text), he needs to parse it. But because the contents of the transcript vary substantially depending on their source (Twitter, Reddit, Discord, etc) we have decided to write a set of [utility functions](./parsers) that correctly parse the verifier's output, given its source.

- Step 6: Bob uses the `twitter.parse()` function from the [`zknotary-parsers`](./parsers) npm package to parse the plain text file and receive in return a structured JSON object from which he can easily extract the important information, i.e, the tweet's data:

  ```json
  {
    "request": { },
    "response":
      "status": "...",
      "headers": { },
      "body": {
            "data": {
              "edit_history_tweet_ids": [
                "1686626240768163840"
              ],
              "id": "1686626240768163840",
              "text": "I endorse this NFT: 0f1a6f87599424233134e77a0214f9ebe2a2a7da73ed3025801412ff34e3ae2a"
            }
          }
  }
  ```

## Setup & Usage

Please refer to the README files for each of the Prover, Verifier and Parser sub-projects for detailed instructions on usage:

1. [Prover](./provers/README.md)
2. [Verifier](./verifier/README.md)
3. [Parsers](./parsers/README.md)

## Future work

1. Create new endpoints for the Prover in order to nataively support more services such as Facebook, Reddit, etc.

2. Replace the `zknotary-verifier` NPM package (which is written in Rust and then compiled to Web Assembly) with native o1js code capable of verifying the TLSNotary proof.

## License

This project is licensed under the [Apache-2.0](LICENSE) License.
