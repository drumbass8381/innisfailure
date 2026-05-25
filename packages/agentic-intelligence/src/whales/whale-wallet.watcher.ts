import { xprisma } from "@innisfailures/db";
import type { AgentScope } from "../types/trade-intent.js";
import type { ScoredMarketSignal } from "../types/signals.js";
import type { IWhaleSource } from "./whale-source.interface.js";

export type WhaleWalletWatcherOptions = {
  minUsdNotional: number;
  agents: AgentScope[];
};

export class WhaleWalletWatcher {
  constructor(
    private readonly sources: IWhaleSource[],
    private readonly options: WhaleWalletWatcherOptions,
  ) {}

  async ensureWatch(chain: string, address: string, label?: string) {
    return xprisma.whaleWalletWatch.upsert({
      where: { chain_address: { chain, address } },
      create: { chain, address, label },
      update: { label },
    });
  }

  async poll(): Promise<number> {
    const watches = await xprisma.whaleWalletWatch.findMany({ where: { enabled: true } });
    if (watches.length === 0) return 0;

    let events = 0;
    for (const source of this.sources) {
      const chainWatches = watches.filter((w) => w.chain === source.chain);
      if (chainWatches.length === 0) continue;

      const transfers = await source.pollTransfers(
        chainWatches.map((w) => ({ address: w.address, minUsdAlert: w.minUsdAlert })),
      );

      for (const transfer of transfers) {
        const watch = chainWatches.find((w) => w.address === transfer.address);
        if (!watch) continue;

        const threshold = watch.minUsdAlert ?? this.options.minUsdNotional;
        if (transfer.amountUsd < threshold) continue;

        await xprisma.whaleActivityEvent.create({
          data: {
            watchId: watch.id,
            txSignature: transfer.txSignature,
            direction: transfer.direction,
            tokenSymbol: transfer.tokenSymbol,
            amountUsd: transfer.amountUsd,
            amountRaw: transfer.amountRaw,
          },
        });
        events += 1;
      }
    }

    return events;
  }

  async scoreForAgents(): Promise<ScoredMarketSignal[]> {
    const events = await xprisma.whaleActivityEvent.findMany({
      where: { processed: false },
      include: { watch: true },
      orderBy: { detectedAt: "desc" },
      take: 50,
    });

    const signals: ScoredMarketSignal[] = [];

    for (const event of events) {
      const amountUsd = event.amountUsd ?? 0;
      const baseScore = Math.min(1, amountUsd / this.options.minUsdNotional);

      for (const agent of this.options.agents) {
        if (!agent.enabled) continue;

        const tagMatch = agent.symbolOrScope.toLowerCase().includes(event.watch.chain);
        const score = Math.min(1, baseScore * agent.whaleWeight + (tagMatch ? 0.1 : 0));
        if (score < 0.5) continue;

        signals.push({
          kind: "whale_transfer",
          sourceId: `whale:${event.id}`,
          agentLabel: agent.label,
          symbol: agent.symbolOrScope,
          score,
          payload: {
            kind: "whale_transfer",
            whaleAddress: event.watch.address,
            amountUsd,
            matchedSymbols: event.tokenSymbol ? [event.tokenSymbol] : [],
          },
        });
      }

      await xprisma.whaleActivityEvent.update({
        where: { id: event.id },
        data: { processed: true },
      });
    }

    return signals;
  }
}
