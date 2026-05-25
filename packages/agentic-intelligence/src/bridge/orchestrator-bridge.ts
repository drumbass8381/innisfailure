import type { OrchestratorCommand } from "@innisfailures/orchestrator";
import type { CompositeAgentSignal } from "../trading/signal-aggregator.js";
import type { AgenticTradeIntentDraft } from "../types/trade-intent.js";

/**
 * Maps intelligence layer output into orchestrator policy commands.
 */
export function signalsToOrchestratorCommands(
  composites: CompositeAgentSignal[],
  intents: AgenticTradeIntentDraft[],
): OrchestratorCommand[] {
  const cmds: OrchestratorCommand[] = [];

  for (const composite of composites) {
    if (composite.whaleScore >= 0.85) {
      cmds.push({
        action: "pause_on_signal",
        agentLabel: composite.agentLabel,
        signalKind: "whale_transfer",
        minScore: composite.whaleScore,
        reason: composite.rationale,
      });
    }
  }

  for (const intent of intents) {
    cmds.push({
      action: "propose_trade",
      agentLabel: intent.agentLabel,
      symbol: intent.symbol,
      side: intent.side,
      quantity: intent.quantity,
      notionalUsd: intent.notionalUsd,
      rationale: intent.rationale,
    });
  }

  if (cmds.length === 0) {
    cmds.push({ action: "noop", reason: "agentic_intelligence_idle" });
  }

  return cmds;
}
