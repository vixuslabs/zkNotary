## o1js implementation of zkNotary verifier

### Overview

The goal of this draft is to port the TLS Notary verifier logic from Rust to o1js/Typescript. By doing so, developers would be able to prove much more than what is currently possible for a Mina smart contract. The verifier checks the validity of TLS Notary notarizations, essentially that the source data was not manipulated at all. This would allow developers to create much more intricate and capable smart contracts that can use verifiable sources of data from arbitrary external sources.

### Roadmap

- [x] Research
- [ ] Define data structures and interfaces in TypeScript
- [ ] Implement zkNotary verifier logic
- [ ] Write tests for the verifier
- [ ] Integrate verifier into a Mina smart contract
- [ ] Conduct thorough testing and debugging
- [ ] Document the implementation and usage guidelines
- [ ] Build a demo application to have devs easily test the verifier

### Next Steps

The next steps in the implementation of the o1js zkNotary verifier are to define the necessary data structures and interfaces, and then proceed with the implementation of the verifier logic. Once the verifier is implemented, it will be important to thoroughly test and debug it to ensure its correctness. Additionally, documentation and usage guidelines will be created to assist developers in utilizing the verifier in their Mina smart contracts.

### Challenges

- **Signatures**: In TLSNotary, thus as well as in ZKNotary, the secp256r1 ([NIST P-256 elliptic curve](https://csrc.nist.gov/publications/detail/sp/800-186/final)) signature is used to sign messages and verify signatures. However, Mina uses its own version of the [Schnorr Signature](), the [Mina Schnorr Signatures](https://github.com/MinaProtocol/mina/blob/master/docs/specs/signatures/description.md). So, their are some design choices that must be made. Some options are:
  - **Option 1**: Adapt the zkNotary verifier to use Mina Schnorr Signatures (most likely)
  - **Option 2**: Add support for secp256r1 signatures to Mina (this would be a significant undertaking, outside of the scope of this program)

### Wrap Up

We are in the early stages so everything is subject to change. However, we are excited to build a o1js version for zkNotary verifier! Any and all feedback is welcome. We want to make sure that this implementation is useful, modular, and intuitive for developers to use.
