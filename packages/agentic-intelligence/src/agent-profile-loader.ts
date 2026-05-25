import { xprisma } from "@innisfailures/db";
import { agentScopeSchema, type AgentScope } from "./types/trade-intent.js";

const defaultScope = (row: {
  label: string;
  symbolOrScope: string;
  venue: string;
  enabled: boolean;
  configJson: string;
}): AgentScope => {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(row.configJson || "{}") as Record<string, unknown>;
  } catch {
    parsed = {};
  }

  const merged = {
    label: row.label,
    symbolOrScope: row.symbolOrScope,
    venue: row.venue,
    enabled: row.enabled,
    newsWeight: typeof parsed.newsWeight === "number" ? parsed.newsWeight : 0.5,
    whaleWeight: typeof parsed.whaleWeight === "number" ? parsed.whaleWeight : 0.5,
    minCompositeScore: typeof parsed.minCompositeScore === "number" ? parsed.minCompositeScore : 0.65,
  };

  return agentScopeSchema.parse(merged);
};

export async function loadAgentScopes(): Promise<AgentScope[]> {
  const rows = await xprisma.agentProfile.findMany();
  return rows.map(defaultScope);
}
