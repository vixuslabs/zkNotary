# Prover

## Introduction

The Prover component is a pivotal part of the zkNotary project, designed as a RESTful API using Rust. It employs the Actix-Web framework for its HTTP server functionality. This component is integral in conducting the multiparty computation with the Notary and establishing an MPC TLS session with various web services.

## Getting Started

The Prover is implemented as a REST API, which exposes endpoints for notarizing data from different services like Twitter and Discord. This design choice abstracts the complexities of Rust and multiparty computation, offering a straightforward interface for zkApp developers.

## Usage

The Prover API provides several endpoints, each corresponding to a different web service. To use it, simply send a GET request to the desired endpoint with the required parameters. Here is an example using Twitter:

```
GET /notarize_twitter?tweet_url=https://twitter.com/user/status/1234567890
```

## Running the Prover

To run the Prover, follow these steps:

1. Ensure Rust is installed on your system.
2. Clone the repository and navigate to the `provers` directory.
3. Build and run the project:

```
cargo run
```

4. The server will start and listen for requests on `localhost:3000`.

## Dependencies

The Prover requires the following dependencies:

- Rust programming language
- Actix-Web for the HTTP server framework
- Other Rust dependencies as specified in the `Cargo.toml` file

Also, a notary server needs to be already running. This notary server could be deployed externally (for example on AWS) or run locally (by building and running the [TLSNotary Notary Server project](https://github.com/tlsnotary/tlsn/notary-server)).

## Acknowledgements

zkNotary serves as a wrapper around the innovative TLSNotary Project. As such, a significant portion of the code within this directory originates from the [TLSNotary project](https://github.com/tlsnotary/tlsn), particularly from the `/tlsn/examples` directory. We extend our heartfelt gratitude to the TLSNotary team for their foundational work, which has been instrumental in the development of zkNotary. This collaboration underscores our commitment to building upon open-source projects and contributing to the broader community.

## Contributions

Contributions to the Prover are welcome. Please submit pull requests or raise issues on the project's GitHub page.

## License

This project is licensed under the [Apache-2.0](LICENSE) License.
