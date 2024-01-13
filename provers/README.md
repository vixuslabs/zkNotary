# Prover

## Introduction

The Prover component is a pivotal part of the zkNotary project, designed as a RESTful API using Rust. It employs the Actix-Web framework for its HTTP server functionality. This component is integral in conducting the multiparty computation with the Notary and establishing an MPC TLS session with various web services.

## Getting Started

The Prover is implemented as a REST API, which exposes endpoints for notarizing data from different services like Twitter and Discord. This design choice abstracts the complexities of Rust and multiparty computation, offering a straightforward interface for zkApp developers.

## Prover Configuration

Before the Prover can be run, some configuration needs to be done on the specific prover file. Some of this configuration is generic (i.e. the notary server host, port and root certificate) and some is service-specific, (i.e. Twitter's API URL).

```rust
// Notary server information
const NOTARY_HOST: &str = "127.0.0.1";
const NOTARY_PORT: u16 = 7047;
const NOTARY_CA_CERT_PATH: &str = "./src/rootCA.crt";

// Twitter API URL
const SERVER_DOMAIN: &str = "api.twitter.com";
const ROUTE: &str = "2/tweets";
```

Also, each service to be noterized (Twitter, Discord, etc) would have specific configuration, such as authorization tokens. This configuration is stored in an `.env` file with the following structure:

```ini
# Discord env variables
USER_AGENT=...
AUTHORIZATION=...
CHANNEL_ID=...

# Twitter API token
TWITTER_BEARER_TOKEN=...

# Other service configuration (Reddit, Facebook, etc)
...
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

## Usage

The Prover API provides several endpoints, each corresponding to a different web service. To use it, simply send a GET request to the desired endpoint with the required parameters. Here is an example using Twitter:

```
GET /notarize_twitter?tweet_url=https://twitter.com/user/status/1234567890
```

The return value would be a JSON object with the following high-level structure:

```json
{
  "notarized_session": {
    {
      "data": { },
      "header": { },
      "signature": { }
    }
   },
  "proof": {
    "session": { },
    "substrings" : { }
   }
}
```

The `proof` section from this JSON object can now be sent to any third party (Bob, in our previous examples) for verification using the [Verifier](../verifier/) codebase.

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

This project is licensed under the [Apache-2.0](../LICENSE) License.
