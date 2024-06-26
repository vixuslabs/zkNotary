# Verifier

## Introduction

The Verifier component of zkNotary is a crucial tool for validating the authenticity of data notarized by the Prover. It's a WebAssembly module compiled from Rust, using [wasm-pack](https://rustwasm.github.io/docs/wasm-pack/introduction.html), and is designed for use within JavaScript applications.

## Purpose
In our updated version of the zkNotary verifier, we are now able to verify proofs that utilize the Mina Schnorr Signature. This is a significant improvement over the previous version, which only supported the secp256r1 signature. With this update, proofs can now be validated on the Mina blockchain, since a json representation of a proof can be passed into a smart contract method, and only if the signature is valid will the transaction be precessed. 

## Limitations
Currently, we can only verify the signature of the [SessionHeader](#) within a smart contract. This is because the signature captured within the SessionHeader is signed using the MinaSchnorr signature, and the smart contract can verify this signature. To verify the substrings, the content of the proof, currently only the ChaCha algorithm is supported. Thus, we can't verify the content of the proof within a smart contract. In the near future, the tlsn team plans on supporting the Poseidon algorthim. This will allow for the verification of the session's transcript within a smart contract.

## Impacts and New Possibilties
Assuming the Poseidon signature is implemented in tlsn, this would allow for many interesting use cases to be possible that once weren't. Some of these use cases are:
  - **Decentralized Oracles in Mina**: With the ability to verify the content of a proof within a smart contract, we can now have decentralized oracles that can provide verifiable data to a smart contract. This would allow for smart contracts to interact with the outside world in a secure and trustless-ish (must trust the notary) manner.
  - **Trustless and Privacy Preserving Identity Verification**: With the ability to verify the content of a proof within a smart contract, we can now have decentralized identity verification fully on chain. This would allow for smart contracts to verify the identity of a user.
  - **Verifying External Data on Chain**: Data can now be authenticated on chain which can then be used within a smart contract. This would give the blockchain eyes, so to speak.

And many others 🎉

## Features

- **WebAssembly Compilation**: The Rust code is compiled into WebAssembly, making it suitable for integration in web environments.
- **Single Public Function - `verify`**: Exposes a function that takes `proof_json` and `notary_pubkey` as inputs and returns a plain-text notarization of the original interaction with a web server.
- **Digital Signature Validation**: Validates that the proof was digitally signed by the notary server, ensuring authenticity.

## Prerequisites

- Rust
- Cargo
- wasm-pack

Note: This project requires a clang version newer than 16.0.0 to compile ring to wasm. If not, you will run into warning: error: unable to create target: 'No available targets are compatible with triple "wasm32-unknown-unknown"'

## File Structure

- `src/lib.rs`: This is the main library file for the Verifier.
- `src/utils.rs`: This file contains utility functions used by the Verifier.
- `pkg`: Autogenerated directory where the npm package code lives.
- `examples/node`: A sample node application that showcases how to use the verifier package. For more information see the sample application's [README](./examples/node/README.md) file.

## Usage

1. Install wasm-pack

```sh
npm install -g wasm-pack
```

2. Optional: For Mac users with a version of clang older than 16.0.0, you can use Homebrew to install `llvm` and then use it to compile the project.

```sh
brew install llvm
echo 'export PATH="/path/to/your/newly/installed/llvm/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

3. Build the wasm project

```sh
wasm-pack build
```

This creates a new `pkg` directory with the wasm package ready to publish to npmjs.com.

4. Publish your npm package

```sh
cd pkg
npm publish
```

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes you want to make.

## Acknowledgements

This project is inspired by and borrows code from the following projects:

- [Proof Viz](https://github.com/tlsnotary/proof_viz)
- [TLSN](https://github.com/tlsnotary/tlsn)

We are grateful to the authors of these projects for their work.

## License

Apache
