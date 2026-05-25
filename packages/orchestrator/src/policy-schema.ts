import { z } from "zod";

/**
 * Structured policy command — LLM or rules engine must emit only this shape.
 * Executor layer validates against hard rails before applying.
 */
export const orchestratorCommandSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("pause_agent"),
    agentLabel: z.string().min(1),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("resume_agent"),
    agentLabel: z.string().min(1),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("resize_max_notional"),
    agentLabel: z.string().min(1),
    maxNotionalUsd: z.number().positive(),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("pause_on_signal"),
    agentLabel: z.string().min(1),
    signalKind: z.enum(["semantic_news", "whale_transfer", "composite"]),
    minScore: z.number().min(0).max(1),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("propose_trade"),
    agentLabel: z.string().min(1),
    symbol: z.string().min(1),
    side: z.enum(["buy", "sell"]),
    quantity: z.number().positive().optional(),
    notionalUsd: z.number().positive().optional(),
    rationale: z.string().max(2000),
  }),
  z.object({
    action: z.literal("noop"),
    reason: z.string().max(500).optional(),
  }),
]);

export type OrchestratorCommand = z.infer<typeof orchestratorCommandSchema>;

export const policyEnvelopeSchema = z.object({
  commands: z.array(orchestratorCommandSchema).max(32),
  model: z.string().max(120).optional(),
});

export type PolicyEnvelope = z.infer<typeof policyEnvelopeSchema>;
