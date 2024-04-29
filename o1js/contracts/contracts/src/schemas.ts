import { z } from 'zod';

const DocumentSchema = z.object({
  index: z.string(),
  source: z.string(),
  document_content: z.string(),
});

const SignatureSchema = z.object({
  MinaSchnorr: z.string(),
});

const ServerPublicKeySchema = z.object({
  group: z.array(z.number()),
  key: z.array(z.number()),
});

const HandshakeSummarySchema = z.object({
  time: z.number(),
  server_public_key: ServerPublicKeySchema,
  handshake_commitment: z.array(z.number()),
});

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
});

export const RootSchema = z.object({
  session: SessionSchema,
});

export type RootSchemaValuesType = z.infer<typeof RootSchema>;

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
