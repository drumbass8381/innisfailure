export type AgentDescriptor = {
  label: string;
  /** Matches `ExecutionVenue` in @innisfailures/types (`CEX_CCXT` | `SOLANA_DEX`). */
  venue: string;
  enabled: boolean;
  symbolOrScope: string;
};

/**
 * In-process agent registry stub; swap for DB-backed registry later.
 */
export class AgentPool {
  private agents = new Map<string, AgentDescriptor>();

  register(agent: AgentDescriptor) {
    this.agents.set(agent.label, agent);
  }

  list(): AgentDescriptor[] {
    return [...this.agents.values()];
  }

  get(label: string): AgentDescriptor | undefined {
    return this.agents.get(label);
  }
}
