<div align="center">

# Creating a zkNotary Verifier in o1js

</div>

## Introduction

zkNotary is a project that enables privacy-preserving and verifiable retrieval of web content using the TLSNotary protocol. It leverages the TLSNotary protocol to generate proofs of the content served by a website at a specific point in time. The goal of this effort is to rebuild the verifier component of zkNotary using o1js, a TypeScript library for writing provable smart contracts on the Mina blockchain. By implementing the verifier in o1js, we can ensure that the verification process is provable and can be executed within Mina smart contracts.

## Challenges and Requirements

### Integrating MinaSchnorr Signature

One of the main challenges in rebuilding the zkNotary verifier in o1js is integrating the MinaSchnorr signature scheme. This requires refactoring the existing `tlsn` repository and adding support for the `mina_signer` and `mina_hasher` crates. We need to implement an updated `NotaryPublicKey` and a new `TLSNSignature` type to accommodate the MinaSchnorr signature.

### Serialization and Deserialization

Proper serialization and deserialization of the `TLSNSignature` is crucial for compatibility between Rust and TypeScript. Since the `mina_signer::Signature` does not implement `serde::{Serialize, Deserialize}`, we need to ensure that we implement this correctly while maintaining compatibility with the existing `P256` signature. We use the Binary Canonical Serialization (BCS) format on both the Rust and TypeScript sides to ensure deterministic serialization of the session header.

On the TypeScript side, we receive a JSON file containing the proof. From this proof, we extract the header and transform it into an array of o1js `Field`s. Initially, we used bytes for the signature encoding in the JSON file, but we have now switched to base58 encoding for improved compatibility. We generate the signature directly from the base58 encoding instead of converting it from a field array.

### Upcoming `tlsn-core` Rework

The `tlsn-core` library is undergoing a significant rework, which will introduce breaking changes. The team behind `tlsn-core` plans to expose a trait for implementing additional signature schemes rather than using an enum for the signature type. This change aligns well with our goal of integrating MinaSchnorr signature support.

However, the rework may introduce other challenges, such as verifying the TLS certificate chain and the server's RSA/ECDSA signature on the ECDH exchange data. Additionally, the next release of `tlsn-core` will support using SHA2, Blake3, Keccak, and Poseidon (BN254) for the Merkle hash algorithm, which may require further adaptations in our implementation.

## Current Progress and Testing

We are creating a minimal repository called `tlsn-signature-verifier` to test our changes made to TLSNotary. Currently, we are using the proof generated from the `simple` examples in the `tsln` repo by copying and pasting it. Ideally, an API request would be made to the `tlsn-server` directly, passing in the data and configuration, and receiving the JSON proof in response. This API-based proof retrieval process is already implemented in the existing zkNotary system.

## Potential Library Creation

To facilitate the adoption of TLSNotary by zkApp developers, we are considering creating a library that allows easy integration into existing or new applications. However, the necessity of a separate library is still unclear, and we will have a better understanding of the appropriate approach as we progress further with the implementation.

## Conclusion

Rebuilding the zkNotary verifier in o1js presents several challenges, primarily related to integrating the MinaSchnorr signature scheme, ensuring proper serialization and deserialization, and adapting to the upcoming changes in the `tlsn-core` library. By leveraging the BCS format and carefully implementing the necessary components, we aim to create a provable and smart contract-compatible verifier for zkNotary. As we continue collaborating with the `tlsn-core` team and testing our implementation, we expect to overcome these challenges and provide a seamless integration experience for zkApp developers.
