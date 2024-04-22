import { Field, Provable, Struct } from 'o1js';

export class SessionHeader extends Struct({
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
}
