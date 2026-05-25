import { xprisma } from "@innisfailures/db";
import { logger } from "@innisfailures/logger";
import { signalsToOrchestratorCommands } from "./bridge/orchestrator-bridge.js";
import { loadAgentScopes } from "./agent-profile-loader.js";
import { SemanticNewsService } from "./news/semantic-news.service.js";
import { StubNewsSource } from "./news/stub-news.source.js";
import { WhaleWalletWatcher } from "./whales/whale-wallet.watcher.js";
import { StubWhaleSource } from "./whales/stub-whale.source.js";
import { aggregateSignalsByAgent } from "./trading/signal-aggregator.js";
import { persistMarketSignal, persistTradeIntent } from "./trading/intent-store.js";
import type { AgenticTradeIntentDraft } from "./types/trade-intent.js";

export type SupervisorTickResult = {
  ingestedNews: number;
  whaleEvents: number;
  signals: number;
  intents: number;
  commands: number;
};

/**
 * One intelligence cycle: ingest → score → persist signals → propose trade intents.
 */
export async function runAgenticTradingTick(): Promise<SupervisorTickResult> {
  const settings = await getOrCreateSettings();
  if (!settings.enabled) {
    return { ingestedNews: 0, whaleEvents: 0, signals: 0, intents: 0, commands: 0 };
  }

  const agents = await loadAgentScopes();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let ingestedNews = 0;
  let whaleEvents = 0;

  if (settings.newsEnabled) {
    const news = new SemanticNewsService([new StubNewsSource()], {
      minRelevanceScore: settings.minNewsRelevanceScore,
      agents,
    });
    ingestedNews = await news.ingestSince(since);
  }

  if (settings.whaleWatchingEnabled) {
    const whales = new WhaleWalletWatcher([new StubWhaleSource("solana"), new StubWhaleSource("ethereum")], {
      minUsdNotional: settings.minWhaleUsdNotional,
      agents,
    });
    whaleEvents = await whales.poll();
  }

  const newsService = new SemanticNewsService([new StubNewsSource()], {
    minRelevanceScore: settings.minNewsRelevanceScore,
    agents,
  });
  const whaleWatcher = new WhaleWalletWatcher([new StubWhaleSource("solana")], {
    minUsdNotional: settings.minWhaleUsdNotional,
    agents,
  });

  const newsSignals = settings.newsEnabled ? await newsService.scoreForAgents(since) : [];
  const whaleSignals = settings.whaleWatchingEnabled ? await whaleWatcher.scoreForAgents() : [];
  const allSignals = [...newsSignals, ...whaleSignals];

  for (const signal of allSignals) {
    await persistMarketSignal({
      kind: signal.kind,
      sourceId: signal.sourceId,
      agentLabel: signal.agentLabel,
      symbol: signal.symbol,
      score: signal.score,
      payload: signal.payload,
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    });
  }

  const composites = aggregateSignalsByAgent(allSignals, agents);
  const intents: AgenticTradeIntentDraft[] = [];

  for (const composite of composites) {
    const intent: AgenticTradeIntentDraft = {
      agentLabel: composite.agentLabel,
      symbol: composite.symbol,
      side: composite.whaleScore > composite.newsScore ? "sell" : "buy",
      rationale: composite.rationale,
      notionalUsd: 100,
      signalIds: [],
    };
    await persistTradeIntent(intent);
    intents.push(intent);
  }

  const commands = signalsToOrchestratorCommands(composites, intents);
  for (const cmd of commands) {
    await xprisma.policyAuditLog.create({
      data: {
        source: "rules",
        actionJson: JSON.stringify(cmd),
        applied: cmd.action === "noop",
      },
    });
  }

  logger.info(
    {
      ingestedNews,
      whaleEvents,
      signals: allSignals.length,
      intents: intents.length,
      commands: commands.length,
    },
    "agentic_trading_tick_complete",
  );

  return {
    ingestedNews,
    whaleEvents,
    signals: allSignals.length,
    intents: intents.length,
    commands: commands.length,
  };
}

export async function getOrCreateSettings() {
  let row = await xprisma.agenticIntelligenceSettings.findFirst();
  if (!row) {
    row = await xprisma.agenticIntelligenceSettings.create({ data: {} });
  }
  return row;
}
