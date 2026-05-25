import { trpc } from "../trpc.js";
import {
  botRouter,
  cronRouter,
  exchangeAccountsRouter,
  dcaBotRouter,
  gridBotRouter,
  smartTradeRouter,
  symbolsRouter,
  candlesRouter,
  orderRouter,
  intelligenceRouter,
} from "./private/router.js";
import { publicRouter } from "./public/router.js";

export const appRouter = trpc.router({
  exchangeAccount: exchangeAccountsRouter,
  symbol: symbolsRouter,
  candles: candlesRouter,
  bot: botRouter,
  dcaBot: dcaBotRouter,
  gridBot: gridBotRouter,
  smartTrade: smartTradeRouter,
  order: orderRouter,
  cron: cronRouter,
  intelligence: intelligenceRouter,
  public: publicRouter,
});

export type AppRouter = typeof appRouter;
