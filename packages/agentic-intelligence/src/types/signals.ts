import { z } from "zod";

export const marketSignalKindSchema = z.enum(["semantic_news", "whale_transfer", "composite"]);

export type MarketSignalKind = z.infer<typeof marketSignalKindSchema>;

export const semanticNewsDraftSchema = z.object({
  externalId: z.string().optional(),
  source: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().optional(),
  publishedAt: z.coerce.date(),
  symbols: z.array(z.string()).default([]),
  sentiment: z.number().min(-1).max(1).optional(),
});

export type SemanticNewsDraft = z.infer<typeof semanticNewsDraftSchema>;

export const whaleTransferDraftSchema = z.object({
  chain: z.string().min(1),
  address: z.string().min(1),
  txSignature: z.string().optional(),
  direction: z.enum(["in", "out"]),
  tokenSymbol: z.string().optional(),
  amountUsd: z.number().positive(),
  amountRaw: z.string().optional(),
});

export type WhaleTransferDraft = z.infer<typeof whaleTransferDraftSchema>;

export const marketSignalPayloadSchema = z.object({
  kind: marketSignalKindSchema,
  headline: z.string().optional(),
  summary: z.string().optional(),
  whaleAddress: z.string().optional(),
  amountUsd: z.number().optional(),
  sentiment: z.number().optional(),
  matchedSymbols: z.array(z.string()).default([]),
});

export type MarketSignalPayload = z.infer<typeof marketSignalPayloadSchema>;

export type ScoredMarketSignal = {
  kind: MarketSignalKind;
  sourceId: string;
  agentLabel?: string;
  symbol?: string;
  score: number;
  payload: MarketSignalPayload;
};
