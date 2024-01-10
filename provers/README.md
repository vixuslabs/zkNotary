# Provers

This directory contains the source code for the Provers component of the zkNotary project.

## Prerequisites

- Rust
- Cargo

## File Structure

- `src/`: This directory contains the source code for the Provers.
- `Cargo.toml`: This file contains the list of Rust dependencies for the Provers.

## Acknowledgements

Almost all the code in this directory was taken from the [TLSNotary project](https://github.com/tlsnotary/tlsn), specifically from the `/tlsn/examples` directory.

## Usage

The examples were modified to allow the user to execute the code by issuing a REST API call to an endpoint. In other words, the `zknotary/provers` project exposes a REST API that the user calls to generate the notarization and corresponding proof.

A notary server needs to be already running. This notary server could be deployed externally (for example on AWS) or running locally (by building and running the [TLSNotary Notary Server project](https://github.com/tlsnotary/tlsn/notary-server)).

## Setup

1. Build the project:

```sh
cargo build
```

2. Run the Provers:

```sh
cargo run
```

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes you want to make.

## License

Apache
