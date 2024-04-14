# Mina zkApp: O1js Verifier

## Introduction

The o1js-verifier component of zkNotary is a vital tool for authenticating data notarized by the TLSNotary Prover. It is written purely in TypeScript using o1js primitives (which are provable), thus making it suitable for integration with Mina smart contracts. This approach ensures compatibility and efficiency within the Mina protocol ecosystem without relying on WebAssembly.

## Features

So far, the o1js verifier is capable of verifying the digital signature of the session header that comes inside a TLS Notary proof. This digital signature needs to be a Mina-compatible Schnorr signature.

In order to provide the full functionality of the verifier's Rust implementation, we need to also verify the substrings proof against the session header. Following is a brief overview of what this would entail:

### Substring verification

In order to verify the substrings proof against the session header, the following tasks need to be performed:

1. Extract the `openings` and the `inclusion proof` (a Merkle proof) from the substrings section of the TLS Notary proof.
2. Iterate over all the openings. For each opening:

- Make sure the amount of data being proved is bounded
- Make sure the opening length matches the ranges length
- Make sure duplicate data is not opened
- Make sure the ranges are within the bounds of the transcript
- Generate the expected encodings for the purported data in the opening
- Compute the expected hash of the commitment to make sure it is present in the merkle tree
- Make sure the length of data from the opening matches the commitment
- Iterate over the ranges backwards, copying the data from the opening then truncating it

3. Verify that the expected hashes are present in the merkle tree
4. Iterate over the unioned ranges and ensure that the slices are sorted and disjoint
5. Return the redacted transcripts for the sent and received data.

## Usage

Clone the repository:

```shell
git clone https://github.com/vixuslabs/zkNotary.git
```

Install dependencies:

```shell
npm install
```

Run the tests:

```shell
npm run test
```

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes you want to make.

## License

[Apache-2.0](LICENSE)
