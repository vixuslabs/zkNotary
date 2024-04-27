import {
  SmartContract,
  state,
  State,
  method,
  Signature,
  PublicKey,
} from 'o1js';

import { SessionHeader } from './SessionHeader';

export class TlsnVerifier extends SmartContract {
  @state(PublicKey) notaryPublicKey = State<PublicKey>();

  @method async verify(
    sessionHeader: SessionHeader,
    signature: Signature
  ) {
    // Get the notary public key from the contract state
    const notaryPublicKey = this.notaryPublicKey.getAndRequireEquals();

    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(notaryPublicKey, sessionHeader.toFields());
    validSignature.assertTrue("Signature is not valid");
  }
}