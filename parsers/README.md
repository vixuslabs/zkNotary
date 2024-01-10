# Parsers

This package provides utilities to parse the text output of the `zknotary-verifier` according to specific rules depending on the nature of the notarization.

If the proof is valid, the verifier's output consists of the original notarization of the TLS session created by TLSNotary. This notarization is made up of unstructured text that varies significantly depending on the type of data that was notarized in the first place. To help developers more easily process the verifier's output, we have created a set of application-specific parsers.

## Installation

To install the `zknotary-parsers` package, use the following command:

```sh
npm install zknotary-parsers
```

## Usage

First, import the required parser from the zknotary-parsers package. For example, to use the Twitter parser:

```js
import { twitter } from "zknotary-parsers";
```

Then, you can use the parser to parse the output of the zknotary-verifier. The parser will return a structured representation of the verification output.

```js
const proof = /* the notarization proof */;
const parsedProof = twitter.parse(proof);
```

## Sample input-output data

Sample notarization data (verifier's output):

```
Successfully verified that the bytes below came from a session with Dns("api.twitter.com") at 2023-12-22 14:37:57 UTC.
Note that the bytes which the Prover chose not to disclose are shown as X.

Bytes sent:

GET https://api.twitter.com/2/tweets/1686626240768163840 HTTP/1.1
host: api.twitter.com
connection: close
authorization: Bearer XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



Bytes received:

HTTP/1.1 200 OK
date: Fri, 22 Dec 2023 14:38:24 UTC
perf: 7469935968
server: tsa_b
set-cookie: guest_id_marketing=v1%3A170325590481896779; Max-Age=63072000; Expires=Sun, 21 Dec 2025 14:38:24 GMT; Path=/; Domain=.twitter.com; Secure; SameSite=None
set-cookie: guest_id_ads=v1%3A170325590481896779; Max-Age=63072000; Expires=Sun, 21 Dec 2025 14:38:24 GMT; Path=/; Domain=.twitter.com; Secure; SameSite=None
set-cookie: personalization_id="v1_hdXxlfW6nEK3GB5UJsaRQA=="; Max-Age=63072000; Expires=Sun, 21 Dec 2025 14:38:24 GMT; Path=/; Domain=.twitter.com; Secure; SameSite=None
set-cookie: guest_id=v1%3A170325590481896779; Max-Age=63072000; Expires=Sun, 21 Dec 2025 14:38:24 GMT; Path=/; Domain=.twitter.com; Secure; SameSite=None
api-version: 2.86
content-type: application/json; charset=utf-8
cache-control: no-cache, no-store, max-age=0
content-length: 180
x-access-level: read
x-frame-options: SAMEORIGIN
x-transaction-id: 6dfe55da7f578725
x-xss-protection: 0
x-rate-limit-limit: 15
x-rate-limit-reset: 1703256804
content-disposition: attachment; filename=json.json
x-content-type-options: nosniff
x-rate-limit-remaining: 14
strict-transport-security: max-age=631138519
x-response-time: 37
x-connection-hash: 22dc559a1704367f2699d82111221950d1edb842efbe2ac69d8d26831bcce62b
connection: close

{"data":{"edit_history_tweet_ids":["1686626240768163840"],"id":"1686626240768163840","text":"I endorse this NFT: 0f1a6f87599424233134e77a0214f9ebe2a2a7da73ed3025801412ff34e3ae2a"}}
```

Corresponding parsed output:

```json
{
  "request": {
    "method": "GET",
    "url": "https://api.twitter.com/2/tweets/1686626240768163840",
    "headers": {
      "host": "api.twitter.com",
      "connection": "close",
      "authorization": "Bearer XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  },
  "response": {
    "status": "HTTP/1.1 200 OK",
    "headers": {
      "date": "Fri, 22 Dec 2023 14:38:24 UTC",
      "perf": "7469935968",
      "server": "tsa_b",
      "set-cookie": "guest_id=v1%3A170325590481896779; Max-Age=63072000; Expires=Sun, 21 Dec 2025 14:38:24 GMT; Path=/; Domain=.twitter.com; Secure; SameSite=None",
      "api-version": "2.86",
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-cache, no-store, max-age=0",
      "content-length": "180",
      "x-access-level": "read",
      "x-frame-options": "SAMEORIGIN",
      "x-transaction-id": "6dfe55da7f578725",
      "x-xss-protection": "0",
      "x-rate-limit-limit": "15",
      "x-rate-limit-reset": "1703256804",
      "content-disposition": "attachment; filename=json.json",
      "x-content-type-options": "nosniff",
      "x-rate-limit-remaining": "14",
      "strict-transport-security": "max-age=631138519",
      "x-response-time": "37",
      "x-connection-hash": "22dc559a1704367f2699d82111221950d1edb842efbe2ac69d8d26831bcce62b",
      "connection": "close"
    },
    "body": {
      "data": {
        "edit_history_tweet_ids": ["1686626240768163840"],
        "id": "1686626240768163840",
        "text": "I endorse this NFT: 0f1a6f87599424233134e77a0214f9ebe2a2a7da73ed3025801412ff34e3ae2a"
      }
    }
  }
}
```

## Available Parsers

The `zknotary-parsers package`` currently includes the following parsers:

- twitter: For parsing notarized text related to Twitter API sessions.

More parsers will be added in the future to support other types of notarization proofs.

## Contributing

We welcome contributions to the zknotary-parsers package. Please see the CONTRIBUTING.md file for more information.

## License

Apache
