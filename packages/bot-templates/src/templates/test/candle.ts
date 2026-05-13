import { z } from "zod";
import type { IExchange } from "@innisfailures/exchanges";
import type { MarketData } from "@innisfailures/types";
import type { TBotContext } from "@innisfailures/bot-processor";
import { useMarket, useCandle, useExchange } from "@innisfailures/bot-processor";
import { logger } from "@innisfailures/logger";

export function* testCandle(ctx: TBotContext<any>) {
  const { config: bot, onStart, onStop } = ctx;
  const exchange: IExchange = yield useExchange();

  if (onStart) {
    logger.info(`[CandleStrategy] Bot started. Using ${exchange.exchangeCode} exchange`);
    return;
  }
  if (onStop) {
    logger.info(`[CandleStrategy] Bot stopped`);
    return;
  }

  const market: MarketData = yield useMarket();
  logger.info(market, `[CandleStrategy] Market data`);

  const candle: MarketData["candle"] = yield useCandle();
  logger.info(`[CandleStrategy] Candle ${JSON.stringify(candle)}`);

  logger.info(`[CandleStrategy] Bot template executed successfully`);
}

testCandle.schema = z.object({});
testCandle.hidden = true;
