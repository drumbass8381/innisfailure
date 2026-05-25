import { z } from "zod";
import { xprisma } from "@innisfailures/db";
import {
  getOrCreateSettings,
  runAgenticTradingTick,
} from "@innisfailures/agentic-intelligence";
import { router } from "../../../trpc.js";
import { authorizedProcedure } from "../../../procedures.js";

export const intelligenceRouter = router({
  getSettings: authorizedProcedure.query(async () => {
    return getOrCreateSettings();
  }),

  updateSettings: authorizedProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        newsEnabled: z.boolean().optional(),
        whaleWatchingEnabled: z.boolean().optional(),
        tickIntervalMs: z.number().int().min(5000).optional(),
        minNewsRelevanceScore: z.number().min(0).max(1).optional(),
        minWhaleUsdNotional: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const row = await getOrCreateSettings();
      return xprisma.agenticIntelligenceSettings.update({
        where: { id: row.id },
        data: input,
      });
    }),

  runTick: authorizedProcedure.mutation(async () => runAgenticTradingTick()),

  getOverview: authorizedProcedure.query(async () => {
    const [settings, newsCount, watchCount, signalCount, pendingIntents, paperAssets] = await Promise.all([
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
  }),

  listNews: authorizedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(30) }).optional())
    .query(async ({ input }) => {
      return xprisma.semanticNewsItem.findMany({
        orderBy: { publishedAt: "desc" },
        take: input?.limit ?? 30,
      });
    }),

  listSignals: authorizedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      return xprisma.marketSignal.findMany({
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 50,
      });
    }),

  listTradeIntents: authorizedProcedure
    .input(
      z
        .object({
          status: z.enum(["pending", "approved", "rejected", "executed"]).optional(),
          limit: z.number().int().min(1).max(100).default(30),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return xprisma.agenticTradeIntent.findMany({
        where: input?.status ? { status: input.status } : undefined,
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 30,
      });
    }),

  resolveTradeIntent: authorizedProcedure
    .input(z.object({ id: z.number().int(), status: z.enum(["approved", "rejected"]) }))
    .mutation(async ({ input }) => {
      return xprisma.agenticTradeIntent.update({
        where: { id: input.id },
        data: { status: input.status, resolvedAt: new Date() },
      });
    }),

  listWhaleWatches: authorizedProcedure.query(async () => {
    return xprisma.whaleWalletWatch.findMany({ orderBy: { createdAt: "desc" } });
  }),

  addWhaleWatch: authorizedProcedure
    .input(
      z.object({
        chain: z.string().min(1),
        address: z.string().min(1),
        label: z.string().optional(),
        minUsdAlert: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return xprisma.whaleWalletWatch.upsert({
        where: { chain_address: { chain: input.chain, address: input.address } },
        create: input,
        update: {
          label: input.label,
          minUsdAlert: input.minUsdAlert,
          enabled: true,
        },
      });
    }),

  listWhaleEvents: authorizedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(40) }).optional())
    .query(async ({ input }) => {
      return xprisma.whaleActivityEvent.findMany({
        include: { watch: true },
        orderBy: { detectedAt: "desc" },
        take: input?.limit ?? 40,
      });
    }),

  listAgentProfiles: authorizedProcedure.query(async () => {
    return xprisma.agentProfile.findMany({ orderBy: { label: "asc" } });
  }),

  listPaperAssets: authorizedProcedure.query(async () => {
    return xprisma.paperAsset.findMany({ orderBy: { currency: "asc" } });
  }),

  listPaperOrders: authorizedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(async ({ input }) => {
      return xprisma.paperOrder.findMany({
        orderBy: { lastTradeTimestamp: "desc" },
        take: input?.limit ?? 50,
      });
    }),
});
