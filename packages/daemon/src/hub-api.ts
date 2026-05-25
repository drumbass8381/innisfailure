import type { FastifyInstance } from "fastify";
import { xprisma } from "@innisfailures/db";
import {
  getOrCreateSettings,
  runAgenticTradingTick,
} from "@innisfailures/agentic-intelligence";

/**
 * Lightweight REST API for static hub pages (no tRPC client required).
 */
export async function registerHubApi(fastify: FastifyInstance) {
  fastify.get("/api/hub/overview", async () => {
    const [settings, newsCount, watchCount, signalCount, pendingIntents, paperAssets] =
      await Promise.all([
        getOrCreateSettings(),
        xprisma.semanticNewsItem.count(),
        xprisma.whaleWalletWatch.count({ where: { enabled: true } }),
        xprisma.marketSignal.count({
          where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        }),
        xprisma.agenticTradeIntent.count({ where: { status: "pending" } }),
        xprisma.paperAsset.findMany({ orderBy: { currency: "asc" } }),
      ]);

    return { settings, newsCount, watchCount, signalCount, pendingIntents, paperAssets };
  });

  fastify.get("/api/hub/news", async () => {
    return xprisma.semanticNewsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 40,
    });
  });

  fastify.get("/api/hub/signals", async () => {
    return xprisma.marketSignal.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  });

  fastify.get("/api/hub/intents", async () => {
    return xprisma.agenticTradeIntent.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    });
  });

  fastify.post<{ Body: { id: number; status: "approved" | "rejected" } }>(
    "/api/hub/intents/resolve",
    async (req) => {
      const { id, status } = req.body;
      return xprisma.agenticTradeIntent.update({
        where: { id },
        data: { status, resolvedAt: new Date() },
      });
    },
  );

  fastify.get("/api/hub/whales/watches", async () => {
    return xprisma.whaleWalletWatch.findMany({ orderBy: { createdAt: "desc" } });
  });

  fastify.get("/api/hub/whales/events", async () => {
    return xprisma.whaleActivityEvent.findMany({
      include: { watch: true },
      orderBy: { detectedAt: "desc" },
      take: 40,
    });
  });

  fastify.post<{
    Body: { chain: string; address: string; label?: string; minUsdAlert?: number };
  }>("/api/hub/whales/watch", async (req) => {
    const { chain, address, label, minUsdAlert } = req.body;
    return xprisma.whaleWalletWatch.upsert({
      where: { chain_address: { chain, address } },
      create: { chain, address, label, minUsdAlert },
      update: { label, minUsdAlert, enabled: true },
    });
  });

  fastify.get("/api/hub/paper/assets", async () => {
    return xprisma.paperAsset.findMany({ orderBy: { currency: "asc" } });
  });

  fastify.get("/api/hub/paper/orders", async () => {
    return xprisma.paperOrder.findMany({
      orderBy: { lastTradeTimestamp: "desc" },
      take: 60,
    });
  });

  fastify.get("/api/hub/settings", async () => getOrCreateSettings());

  fastify.post<{
    Body: {
      enabled?: boolean;
      newsEnabled?: boolean;
      whaleWatchingEnabled?: boolean;
      minNewsRelevanceScore?: number;
      minWhaleUsdNotional?: number;
    };
  }>("/api/hub/settings", async (req) => {
    const row = await getOrCreateSettings();
    return xprisma.agenticIntelligenceSettings.update({
      where: { id: row.id },
      data: req.body,
    });
  });

  fastify.post("/api/hub/tick", async () => runAgenticTradingTick());

  fastify.get("/api/hub/agents", async () => {
    return xprisma.agentProfile.findMany({ orderBy: { label: "asc" } });
  });
}
