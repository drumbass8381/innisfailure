import type { ScoredMarketSignal } from "../types/signals.js";
import type { AgentScope } from "../types/trade-intent.js";

export type CompositeAgentSignal = {
  agentLabel: string;
  symbol: string;
  compositeScore: number;
  newsScore: number;
  whaleScore: number;
  signalIds: string[];
  rationale: string;
};

/**
 * Merges news + whale signals per agent into a single actionable score.
 */
export function aggregateSignalsByAgent(
  signals: ScoredMarketSignal[],
  agents: AgentScope[],
): CompositeAgentSignal[] {
  const byAgent = new Map<string, CompositeAgentSignal>();

  for (const signal of signals) {
    if (!signal.agentLabel || !signal.symbol) continue;

    const agent = agents.find((a) => a.label === signal.agentLabel);
    if (!agent?.enabled) continue;

    let row = byAgent.get(signal.agentLabel);
    if (!row) {
      row = {
        agentLabel: signal.agentLabel,
        symbol: signal.symbol,
        compositeScore: 0,
        newsScore: 0,
        whaleScore: 0,
        signalIds: [],
        rationale: "",
      };
      byAgent.set(signal.agentLabel, row);
    }

    row.signalIds.push(signal.sourceId);
    if (signal.kind === "semantic_news") {
      row.newsScore = Math.max(row.newsScore, signal.score);
    } else if (signal.kind === "whale_transfer") {
      row.whaleScore = Math.max(row.whaleScore, signal.score);
    }
    row.compositeScore = Math.min(1, row.newsScore + row.whaleScore);
  }

  const results: CompositeAgentSignal[] = [];

  for (const row of byAgent.values()) {
    const agent = agents.find((a) => a.label === row.agentLabel);
    if (!agent || row.compositeScore < agent.minCompositeScore) continue;

    const parts: string[] = [];
    if (row.newsScore > 0) parts.push(`news=${row.newsScore.toFixed(2)}`);
    if (row.whaleScore > 0) parts.push(`whale=${row.whaleScore.toFixed(2)}`);
    row.rationale = `Composite signal (${parts.join(", ")}) score=${row.compositeScore.toFixed(2)}`;

    results.push(row);
  }

  return results;
}
