import { z } from 'zod';

const DocumentSchema = z.object({
  index: z.string(),
  source: z.string(),
  document_content: z.string(),
});

export const OpeningASchema = z.object({
  kind: z.literal('Blake3'),
  ranges: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
    })
  ),
  direction: z.enum(['Sent', 'Received']),
})

export const OpeningBSchema = z.object({
  Blake3: z.object({
    data: z.array(z.number()),
    nonce: z.array(z.number()),
  }),
})

export const OpeningSchema = z.array(
  z.union([
    OpeningASchema,
    OpeningBSchema
  ])
);

export const InclusionProofSchema = z.object({
  proof: z.array(z.number()),
  total_leaves: z.number(),
});

const SubstringsSchema = z.object({
  openings: z.record(OpeningSchema),
  inclusion_proof: InclusionProofSchema,
});

const KxParamsSchema = z.array(z.number());

const KxSigSchema = z.object({
  scheme: z.enum(['RSA_PSS_SHA256']),
  sig: z.array(z.number()),
});

const ServerKxDetailsSchema = z.object({
  kx_params: KxParamsSchema,
  kx_sig: KxSigSchema,
});

const ClientRandomSchema = z.array(z.number());
const ServerRandomSchema = z.array(z.number());

const ServerCertDetailsSchema = z.object({
  cert_chain: z.array(z.array(z.number())),
  ocsp_response: z.array(z.number()),
  scts: z.null(),
});

const HandshakeDecommitmentSchema = z.object({
  nonce: z.array(z.number()),
  data: z.object({
    server_cert_details: ServerCertDetailsSchema,
    server_kx_details: ServerKxDetailsSchema,
    client_random: ClientRandomSchema,
    server_random: ServerRandomSchema,
  }),
});

const ServerNameSchema = z.object({
  Dns: z.string(),
});

export const SessionInfoSchema = z.object({
  server_name: ServerNameSchema,
  handshake_decommitment: HandshakeDecommitmentSchema,
});

const SignatureSchema = z.string();

const ServerPublicKeySchema = z.object({
  // group: z.string(),
  group: z.array(z.number()),
  key: z.array(z.number()),
});

const HandshakeSummarySchema = z.object({
  time: z.number(),
  server_public_key: ServerPublicKeySchema,
  handshake_commitment: z.array(z.number()),
});

export const HeaderSchema = z.object({
  encoder_seed: z.array(z.number()),
  merkle_root: z.array(z.number()),
  sent_len: z.number(),
  recv_len: z.number(),
  handshake_summary: HandshakeSummarySchema,
});

const SessionSchema = z.object({
  header: HeaderSchema,
  signature: SignatureSchema,
  session_info: SessionInfoSchema,
});

export const RootSchema = z.object({
  session: SessionSchema,
  substrings: SubstringsSchema,
});

type Document = z.infer<typeof DocumentSchema>;
type Root = z.infer<typeof RootSchema>;

const DocumentsSchema = z.object({
  documents: z.array(
    z.object({
      document: DocumentSchema,
    })
  ),
});

type Documents = z.infer<typeof DocumentsSchema>;
