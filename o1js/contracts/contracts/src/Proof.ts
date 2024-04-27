import {
    Field,
    Provable,
    Struct,
    Signature,
  } from 'o1js';
  import { RootSchema } from './schemas';
  import { SessionHeader } from './SessionHeader';
  
  
  // Convert a number to a byte array
  function numberToBytes(num: number) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setInt32(0, num, true);
    return new Uint8Array(buffer);
  }
  
  function bytesToFields(bytes: Uint8Array): Field[] {
    const fields: Field[] = [];
    bytes.forEach((byte: number) => fields.push(Field(byte)));
    return fields;
  }

  class SessionInfo extends Struct({}) {
    toFields(): Field[] {
      return [];
    }
  }

  class Session extends Struct({
    header: SessionHeader,
    signature: Field,
    session_info: SessionInfo,
  }) {
    toFields(): Field[] {
      return [
        ...this.header.toFields(),
        this.signature,
        ...this.session_info.toFields(),
      ];
    }
  }

  class Openings extends Struct({
    opening: Provable.Array(Field, 32)
  }) {
    toFields(): Field[] {
      return [
        ...this.opening,
      ];
    }
  }

  class InclusionProof extends Struct({
    inclusion: Provable.Array(Field, 32),
    openings: Openings,
  }) {
    toFields(): Field[] {
    return [
      ...this.inclusion,
      ...this.openings.toFields(),
    ];
    }
  }

  class Substrings extends Struct({
    openings: Openings,
    inclusion_proof: InclusionProof,
  }) {
    toFields(): Field[] {
      return [
        ...this.openings.toFields(),
        ...this.inclusion_proof.toFields(),
      ];
    }
  }

  export class Proof extends Struct ({
    session: Session,
    substrings: Substrings,
  }) {
    toFields(): Field[] {
      return [
        ...this.session.toFields(),
        ...this.substrings.toFields(),
      ];
    }
  
    static fromJson(jsonData: string): [ SessionHeader, Signature ] {
      // Parse the JSON data
      const parsedData = JSON.parse(jsonData);
      // Replace the string "secp256r1" for its corresponding byte representation.
      parsedData.session.header.handshake_summary.server_public_key.group = [0, 65];
      // Validate the parsed data using Zod
      const result = RootSchema.safeParse(parsedData);
      if (result.success) {
        const tlsnProof = result.data;
        const signature = Signature.fromBase58(tlsnProof.session.signature);
        const encoder_seed = tlsnProof.session.header.encoder_seed;
        const merkle_root = tlsnProof.session.header.merkle_root;
        const sent_len = numberToBytes(tlsnProof.session.header.sent_len);
        const recv_len = numberToBytes(tlsnProof.session.header.recv_len);
        const time = numberToBytes(tlsnProof.session.header.handshake_summary.time);
        const group = tlsnProof.session.header.handshake_summary.server_public_key.group;
        const key = tlsnProof.session.header.handshake_summary.server_public_key.key;
        const handshake_commitment = tlsnProof.session.header.handshake_summary.handshake_commitment;
        return [ new SessionHeader({
          encoderSeed: bytesToFields(new Uint8Array(encoder_seed)),
          merkleRoot: bytesToFields(new Uint8Array(merkle_root)),
          sentLen: bytesToFields(new Uint8Array(sent_len)),
          recvLen: bytesToFields(new Uint8Array(recv_len)),
          handshakeSummary: {
            time: bytesToFields(new Uint8Array(time)),
            serverPublicKey: {
              group: bytesToFields(new Uint8Array(group)),
              key: bytesToFields(new Uint8Array(key)),
            },
            handshakeCommitment: bytesToFields(new Uint8Array(handshake_commitment)),
          },
        }), signature ];
      } else {
        throw new Error(result.error.errors[0].message);
      }
    }
  }