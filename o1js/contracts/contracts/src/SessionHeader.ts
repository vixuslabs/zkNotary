import {
  Field,
  Provable,
  Struct,
} from 'o1js';
import { HeaderSchema } from './schemas';
import { z } from 'zod';

type SessionHeaderType = z.infer<typeof HeaderSchema>;

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

export class SessionHeader extends Struct ({
  encoderSeed: Provable.Array(Field, 32),
  merkleRoot: Provable.Array(Field, 32),
  sentLen: Provable.Array(Field, 8),
  recvLen: Provable.Array(Field, 8),
  handshakeSummary: Struct({
      time: Provable.Array(Field, 8),
      serverPublicKey: Struct({
          group: Provable.Array(Field, 2),
          key: Provable.Array(Field, 65),
      }),
      handshakeCommitment: Provable.Array(Field, 32),
  }),
  }) {
  toFields(): Field[] {
    return [
      ...this.encoderSeed,
      ...this.merkleRoot,
      ...this.sentLen,
      ...this.recvLen,
      ...this.handshakeSummary.time,
      ...this.handshakeSummary.serverPublicKey.group,
      ...this.handshakeSummary.serverPublicKey.key,
      ...this.handshakeSummary.handshakeCommitment,
    ];
  }

  static new(header: SessionHeaderType) {
    return new SessionHeader({
      encoderSeed: bytesToFields(new Uint8Array(header.encoder_seed)),
      merkleRoot: bytesToFields(new Uint8Array(header.merkle_root)),
      sentLen: bytesToFields(new Uint8Array(numberToBytes(header.sent_len))),
      recvLen: bytesToFields(new Uint8Array(numberToBytes(header.recv_len))),
      handshakeSummary: {
        time: bytesToFields(new Uint8Array(numberToBytes(header.handshake_summary.time))),
        serverPublicKey: {
          group: bytesToFields(new Uint8Array(header.handshake_summary.server_public_key.group)),
          key: bytesToFields(new Uint8Array(header.handshake_summary.server_public_key.key)),
        },
        handshakeCommitment: bytesToFields(new Uint8Array(header.handshake_summary.handshake_commitment)),
      },
    });
  }
}