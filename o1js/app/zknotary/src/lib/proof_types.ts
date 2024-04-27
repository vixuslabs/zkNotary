import { z } from "zod";

const OpeningSchema = z.array(
  z.union([
    z.object({
      kind: z.literal("Blake3"),
      ranges: z.array(
        z.object({
          start: z.number(),
          end: z.number(),
        })
      ),
      direction: z.enum(["Sent", "Received"]),
    }),
    z.object({
      Blake3: z.object({
        data: z.array(z.number()),
        nonce: z.array(z.number()),
      }),
    }),
  ])
);

const InclusionProofSchema = z.object({
  proof: z.array(z.unknown()),
  total_leaves: z.number(),
});

const SubstringsSchema = z.object({
  openings: z.record(OpeningSchema),
  inclusion_proof: InclusionProofSchema,
});

const ServerPublicKeySchema = z.object({
  // group: z.string(),
  group: z.array(z.number()),
  key: z.array(z.number()),
});

const KxParamsSchema = z.array(z.number());

const KxSigSchema = z.object({
  scheme: z.enum(["RSA_PSS_SHA256"]),
  sig: z.array(z.number()),
});

const ServerKxDetailsSchema = z.object({
  kx_params: KxParamsSchema,
  kx_sig: KxSigSchema,
});

const ClientRandomSchema = z.array(z.number());
const ServerRandomSchema = z.array(z.number());

const HandshakeSummarySchema = z.object({
  time: z.number(),
  server_public_key: ServerPublicKeySchema,
  handshake_commitment: z.array(z.number()),
});

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

const SessionInfoSchema = z.object({
  server_name: ServerNameSchema,
  handshake_decommitment: HandshakeDecommitmentSchema,
});

const SignatureSchema = z.string();

const HeaderSchema = z.object({
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

export const RootSchemaValues = z.object({
  session: SessionSchema,
  substrings: SubstringsSchema,
});

export const RootSchema = z.object({
  proof: RootSchemaValues,
});

export type RootSchemaSuccessType = z.infer<typeof RootSchema>;
