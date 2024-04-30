import {
  SmartContract,
  state,
  State,
  method,
  Signature,
  PublicKey,
} from 'o1js';

import { SessionHeader } from './SessionHeader';

const NOTARY_PUBLIC_KEY =
  'B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws';

export class TlsnVerifier extends SmartContract {
  @state(PublicKey) notaryPublicKey = State<PublicKey>();

  @method async init() {
    super.init();
    this.notaryPublicKey.set(PublicKey.fromBase58(NOTARY_PUBLIC_KEY));
  }

  @method async verify(sessionHeader: SessionHeader, signature: Signature) {
    // Get the notary public key from the contract state
    const notaryPublicKey = this.notaryPublicKey.getAndRequireEquals();

    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(
      notaryPublicKey,
      sessionHeader.toFields()
    );
    validSignature.assertTrue('Signature is not valid');
  }
}

