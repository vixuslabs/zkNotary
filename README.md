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

Given the limited timeframe (three months) available for the development of this project, we are have constrained zkNotary's scope to retrieving and authenticating data from RESTful APIs only, not generic websites. While this approach is somewhat limiting, we believe it addresses the needs of most zkApp developers.

Our goal has been to provide the Mina community with an easy-to-use building block that can be incorporated into any zkApp architecture, without the need for developers to understand the complexities of the TLS protocol or the inner workings of TLSNotary.

## Implementation
