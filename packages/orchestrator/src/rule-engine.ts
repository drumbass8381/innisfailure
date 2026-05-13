import type { OrchestratorCommand } from "./policy-schema.js";

/**
 * Deterministic fallback when LLM is disabled or invalid.
 */
export function defaultRuleEngineTick(): OrchestratorCommand[] {
  return [{ action: "noop", reason: "rules_engine_idle" }];
}
