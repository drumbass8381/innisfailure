import { z } from "zod";

export const tradeIntentSideSchema = z.enum(["buy", "sell"]);

export const agenticTradeIntentDraftSchema = z.object({
  agentLabel: z.string().min(1),
  symbol: z.string().min(1),
  side: tradeIntentSideSchema,
  quantity: z.number().positive().optional(),
  notionalUsd: z.number().positive().optional(),
  rationale: z.string().min(1).max(2000),
  signalIds: z.array(z.number()).default([]),
});

export type AgenticTradeIntentDraft = z.infer<typeof agenticTradeIntentDraftSchema>;

export const agentScopeSchema = z.object({
  label: z.string().min(1),
  symbolOrScope: z.string().min(1),
  venue: z.string().min(1),
  enabled: z.boolean().default(false),
  newsWeight: z.number().min(0).max(1).default(0.5),
  whaleWeight: z.number().min(0).max(1).default(0.5),
  minCompositeScore: z.number().min(0).max(1).default(0.65),
});

export type AgentScope = z.infer<typeof agentScopeSchema>;
