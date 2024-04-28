import {
  Field,
  Provable,
  Struct,
} from 'o1js';
import { SessionInfoSchema } from './schemas';
import { z } from 'zod';
import { server } from 'typescript';

type SessionInfoType = z.infer<typeof SessionInfoSchema>;

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

export class SessionInfo extends Struct({
  handshakeDecommitment: Struct({
    data: Struct({
      serverCertDetails: Provable.Array(Field, 32),
      serverKxDetails: Provable.Array(Field, 32),
      clientRandom: Provable.Array(Field, 32),
      serverRandom: Provable.Array(Field, 32),
    }),
    nonce: Provable.Array(Field, 32),
  }),
}) {
  toFields(): Field[] {
    return [
      ...this.handshakeDecommitment.data.clientRandom,
      ...this.handshakeDecommitment.data.serverRandom,
      ...this.handshakeDecommitment.data.serverCertDetails,
      ...this.handshakeDecommitment.data.serverKxDetails,
      ...this.handshakeDecommitment.nonce,
    ];
  }

  static new(session_info: SessionInfoType) {
    return new SessionInfo({
      handshakeDecommitment: {
        data: {
          serverCertDetails: 
            bytesToFields(new Uint8Array(session_info.handshake_decommitment.data.server_cert_details.cert_chain.flat()))
            .concat(bytesToFields(new Uint8Array(session_info.handshake_decommitment.data.server_cert_details.ocsp_response.flat()))),
          serverKxDetails: 
            bytesToFields(new Uint8Array(session_info.handshake_decommitment.data.server_kx_details.kx_params))
            .concat(bytesToFields(new Uint8Array(session_info.handshake_decommitment.data.server_kx_details.kx_sig.sig))),
          clientRandom: bytesToFields(new Uint8Array(session_info.handshake_decommitment.data.client_random)),
          serverRandom: bytesToFields(new Uint8Array(session_info.handshake_decommitment.data.server_random)),
        },
        nonce: bytesToFields(new Uint8Array(session_info.handshake_decommitment.nonce)),
      },
    });
  }
}