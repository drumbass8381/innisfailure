import { policyEnvelopeSchema, type OrchestratorCommand } from "./policy-schema.js";
import { defaultRuleEngineTick } from "./rule-engine.js";
import { AgentPool } from "./agent-pool.js";

export type OrchestratorDeps = {
  llmEnabled: boolean;
  audit: (cmd: OrchestratorCommand, source: "rules" | "llm", applied: boolean, error?: string) => Promise<void>;
};

/**
 * Central supervisor skeleton: consumes structured commands and coordinates agents.
 */
export class MetaOrchestrator {
  readonly agents = new AgentPool();

  constructor(private readonly deps: OrchestratorDeps) {}

  /**
   * Parse LLM JSON (if enabled). On failure, falls back to deterministic rules.
   */
  async consumePolicyJson(raw: unknown): Promise<OrchestratorCommand[]> {
    if (!this.deps.llmEnabled) {
      const cmds = defaultRuleEngineTick();
      for (const c of cmds) await this.deps.audit(c, "rules", true);
      return cmds;
    }
    const parsed = policyEnvelopeSchema.safeParse(raw);
    if (!parsed.success) {
      const fallback = defaultRuleEngineTick();
      for (const c of fallback) await this.deps.audit(c, "llm", false, parsed.error.message);
      return fallback;
    }
    for (const c of parsed.data.commands) await this.deps.audit(c, "llm", true);
    return parsed.data.commands;
  }
}
