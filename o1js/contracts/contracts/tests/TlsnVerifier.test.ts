import fs from 'fs';
import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Signature,
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  ZkappPublicInput,
} from 'o1js';
import { SessionHeader } from '../src/SessionHeader';
import { TlsnVerifier } from '../src/TlsnVerifier';

describe('TlsnVerifier', () => {
  describe('Standalone verification', () => {
    it('should verify a valid proof.', () => {
      const jsonData = fs.readFileSync('tests/valid_proof.json', 'utf-8');
      const [ sessionHeader, signature ] = SessionHeader.fromJson(jsonData);
      const notaryPublicKey = PublicKey.fromBase58("B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws");
      const validSignature = signature.verify(notaryPublicKey, sessionHeader.toFields());
      validSignature.assertTrue("Signature is not valid");
    });
  
    it('should not verify an invalid proof.', () => {
      const jsonData = fs.readFileSync('tests/invalid_proof.json', 'utf-8');
      const [ sessionHeader, signature ] = SessionHeader.fromJson(jsonData);
      const notaryPublicKey = PublicKey.fromBase58("B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws");
      const validSignature = signature.verify(notaryPublicKey, sessionHeader.toFields());
      expect(() => validSignature.assertTrue()).toThrow();
    });
  
    it('should not verify a proof with a different notary public key.', () => {
      const jsonData = fs.readFileSync('tests/valid_proof.json', 'utf-8');
      const [ sessionHeader, signature ] = SessionHeader.fromJson(jsonData);
      const notaryPublicKey = PublicKey.fromBase58("B62qnw2dEQgvJWVh4wqPP141gqMdwUWUkjJsByxmTi7csKVC9M4C3P2");
      const validSignature = signature.verify(notaryPublicKey, sessionHeader.toFields());
      expect(() => validSignature.assertTrue()).toThrow();
    });
  });

  describe('Verification on a local blockchain', () => {
    let deployerKey: PrivateKey,
      deployerAccount: PublicKey,
      senderKey: PrivateKey,
      senderAccount: PublicKey,
      zkAppInstance: TlsnVerifier;

    async function localDeploy(notaryPublicKey: PublicKey) {
      const zkAppPrivateKey = PrivateKey.random();
      const zkAppAddress = zkAppPrivateKey.toPublicKey();

      zkAppInstance = new TlsnVerifier(zkAppAddress);
      const deployTxn = await Mina.transaction(deployerAccount, async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkAppInstance.deploy();
        zkAppInstance.notaryPublicKey.set(notaryPublicKey);
      });
      await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    beforeAll(async () => {
      const Local = Mina.LocalBlockchain({ proofsEnabled: false });
      Mina.setActiveInstance(Local);
      ({ privateKey: deployerKey, publicKey: deployerAccount } =
        Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } =
        Local.testAccounts[1]);
    });

    it('should verify a valid proof.', async () => {
      const jsonData = fs.readFileSync('tests/valid_proof.json', 'utf-8');
      const [ sessionHeader, signature ] = SessionHeader.fromJson(jsonData);
      await localDeploy(PublicKey.fromBase58("B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws"));    
      const txn1 = await Mina.transaction(senderAccount, () => {
        zkAppInstance.verify(sessionHeader, signature);
      });
      await txn1.prove();
      await txn1.sign([senderKey]).send();
    });

    // it('should not verify an invalid proof', async () => {
    //   // Read the JSON file containing the proof
    //   const jsonData = fs.readFileSync('tests/invalid_proof.json', 'utf-8');
    //   const [ sessionHeader, signature ] = SessionHeader.fromJson(jsonData);
    //   await localDeploy(PublicKey.fromBase58("B62qowWuY2PsBZsm64j4Uu2AB3y4L6BbHSvtJcSLcsVRXdiuycbi8Ws"));    
    //   await expect(Mina.transaction(senderAccount, () => {
    //       zkAppInstance.verify(sessionHeader, signature);
    //   })).resolves.toThrow("Signature is not valid");
    // });

    // it('should not verify a proof with a different notary public key.', async () => {
    //   // Read the JSON file containing the proof
    //   const jsonData = fs.readFileSync('tests/valid_proof.json', 'utf-8');
    //   const [ sessionHeader, signature ] = SessionHeader.fromJson(jsonData);
    //   await localDeploy(PublicKey.fromBase58("B62qnw2dEQgvJWVh4wqPP141gqMdwUWUkjJsByxmTi7csKVC9M4C3P2"));    
    //   const txn1 = await Mina.transaction(senderAccount, () => {
    //     zkAppInstance.verify(sessionHeader, signature);
    //   });
    //   await txn1.prove();
    //   await txn1.sign([senderKey]).send();
    // });
  });
});
