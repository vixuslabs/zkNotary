import {
  Field,
  Provable,
  Struct,
  Signature as MinaSignature,
  Bool,
} from 'o1js';
import { RootSchema, OpeningASchema, OpeningBSchema, OpeningSchema } from './schemas';
import { SessionHeader } from './SessionHeader';
import { SessionInfo } from './SessionInfo';
import { z } from 'zod';

type RootType = z.infer<typeof RootSchema>;
type SubstringsType = RootType['substrings'];
type InclusionProofType = SubstringsType['inclusion_proof'];
type OpeningSchemaType = z.infer<typeof OpeningSchema>;
type OpeningASchemaType = z.infer<typeof OpeningASchema>;
type OpeningBSchemaType = z.infer<typeof OpeningBSchema>;

function bytesToFields(bytes: Uint8Array): Field[] {
  const fields: Field[] = [];
  bytes.forEach((byte: number) => fields.push(Field(byte)));
  return fields;
}

class Signature extends Struct({
  MinaSchnorr: MinaSignature,
}) {
  toFields(): Field[] {
    return this.MinaSchnorr.toFields();
  }

  static new(signature: string): Signature {
    return new Signature({
      MinaSchnorr: MinaSignature.fromBase58(signature),
    });
  }
}

class Session extends Struct({
  header: SessionHeader,
  signature: Signature,
  session_info: SessionInfo,
}) {
  toFields(): Field[] {
    return [
      ...this.header.toFields(),
      ...this.signature.toFields(),
      ...this.session_info.toFields(),
    ];
  }

  static new(header: SessionHeader, signature: Signature, session_info: SessionInfo): Session {
    return new Session({
      header: header,
      signature: signature,
      session_info: session_info,
    });
  }
}

class Range extends Struct({
  end: Field,
  start: Field,
}) {
  toFields(): Field[] {
    return [
      this.end,
      this.start,
    ];
  }

  static new(start: Field, end: Field): Range {
    return new Range({
      end: end,
      start: start,
    });
  }
}

class OpeningA extends Struct({
  direction: Bool,
  ranges: Provable.Array(Range, 32)
}) {
  toFields(): Field[] {
    return [
      ...this.ranges.map((range) => range.toFields()).flat(),
    ];
  }

  static new(opening: OpeningASchemaType): OpeningA {
    return new OpeningA({
      direction: Bool(opening.direction === 'Received'),
      ranges: opening.ranges.map((range) => Range.new(Field(range.start), Field(range.end))),
    });
  }
}

class OpeningB extends Struct({
  data: Provable.Array(Field, 32),
  nonce: Provable.Array(Field, 32)
}) {
  toFields(): Field[] {
    return [
      ...this.data,
      ...this.nonce,
    ];
  }

  static new(opening: OpeningBSchemaType): OpeningB {
    return new OpeningB({
      data: bytesToFields(new Uint8Array(opening.Blake3.data)),
      nonce: bytesToFields(new Uint8Array(opening.Blake3.nonce)),
    });
  }
}

class Openings extends Struct({
  openings_a: Provable.Array(OpeningA, 32),
  openings_b: Provable.Array(OpeningB, 32),

}) {
  toFields(): Field[] {
    return [
      ...this.openings_a.map((opening) => opening.toFields()).flat(),
      ...this.openings_b.map((opening) => opening.toFields()).flat(),
    ];
  }

  static new(openings_a: OpeningASchemaType[], openings_b: OpeningBSchemaType[]): Openings {
    const oa = [];
    for (let i = 0; i < openings_a.length; i++) {
      oa.push(OpeningA.new(openings_a[i]));
    }
    const ob = [];
    for (let i = 0; i < openings_b.length; i++) {
      ob.push(OpeningB.new(openings_b[i]));
    }
    return new Openings({
      openings_a: oa,
      openings_b: ob,
    });
  }
}

class InclusionProof extends Struct({
  proof: Provable.Array(Field, 32),
  total_leaves: Field,
}) {
  toFields(): Field[] {
    return [
      ...this.proof,
      ...this.total_leaves.toFields(),
    ];
  }

  static new(inclusion_proof: InclusionProofType): InclusionProof {
    return new InclusionProof({
      proof: inclusion_proof.proof.map((field) => Field(field)),
      total_leaves: Field(inclusion_proof.total_leaves),
    });
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

  static new(openings: Openings, inclusion_proof: InclusionProof): Substrings {
    return new Substrings({
      openings: openings,
      inclusion_proof: inclusion_proof,
    });
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

  static fromJson(jsonData: string): Proof {
    // Parse the JSON data
    const parsedData = JSON.parse(jsonData);
    // Replace the string "secp256r1" for its corresponding byte representation.
    parsedData.session.header.handshake_summary.server_public_key.group = [0, 65];
    // Validate the parsed data using Zod
    const result = RootSchema.safeParse(parsedData);
    if (result.success) {
      const tlsnProof = result.data;
      const session = tlsnProof.session;
      const substrings = tlsnProof.substrings;

      // Create the OpeningA and OpeningB objects
      let aObjects: OpeningASchemaType[] = [];
      let bObjects: OpeningBSchemaType[] = [];
      Object.values(substrings.openings).forEach(openingArray => {
        if (openingArray[0]) {
          aObjects.push(openingArray[0] as OpeningASchemaType);
        }
        if (openingArray[1]) {
          bObjects.push(openingArray[1] as OpeningBSchemaType);
        }
      });
      
      return new Proof({
          session: Session.new(
              SessionHeader.new(session.header),
              Signature.new(session.signature),
              SessionInfo.new(session.session_info),
          ),
          substrings: Substrings.new(
              Openings.new(aObjects, bObjects),
              InclusionProof.new(substrings.inclusion_proof),
          ),
      });
    } else {
      throw new Error(result.error.errors[0].message);
    }
  }
}