import { z } from "zod";
import type { IExchange } from "@innisfailures/exchanges";
import type { IBotConfiguration, SmartTradeService, TBotContext } from "@innisfailures/bot-processor";
import { cancelSmartTrade, useExchange, useSmartTrade } from "@innisfailures/bot-processor";
import { computeGridLevelsFromCurrentAssetPrice, decomposeSymbol } from "@innisfailures/tools";
import type { IGetMarketPriceResponse } from "@innisfailures/types";
import { logger } from "@innisfailures/logger";

/**
 * Advanced grid bot template.
 * The template allows specifying grid lines with custom prices and quantities.
 */
export function* gridBot(ctx: TBotContext<GridBotConfig>) {
  const { config: bot, onStart, onStop } = ctx;
  const symbol = bot.symbol;
  const { quoteCurrency } = decomposeSymbol(symbol);

  const exchange: IExchange = yield useExchange();

  let price = 0;
  if (onStart) {
    const { price: markPrice }: IGetMarketPriceResponse = yield exchange.getMarketPrice({
      symbol,
    });
    price = markPrice;
    logger.info(`[Grid] Bot strategy started on ${symbol} pair. Current price is ${price} ${quoteCurrency}`);
  }

  const gridLevels = computeGridLevelsFromCurrentAssetPrice(bot.settings.gridLines, price);

  if (onStop) {
    for (const [index, _grid] of gridLevels.entries()) {
      yield cancelSmartTrade(`${index}`);
    }

    return;
  }

  for (const [index, grid] of gridLevels.entries()) {
    const smartTrade: SmartTradeService = yield useSmartTrade(
      {
        entry: {
          type: "Limit",
          side: "Buy",
          price: grid.buy.price,
          status: grid.buy.status,
        },
        tp: {
          type: "Limit",
          side: "Sell",
          price: grid.sell.price,
          status: grid.sell.status,
        },
        quantity: grid.buy.quantity, // or grid.sell.quantity
      },
      `${index}`,
    );

    if (smartTrade.isCompleted()) {
      yield smartTrade.replace();
    }
  }
}

gridBot.displayName = "Grid Bot Advanced";
gridBot.hidden = true;
gridBot.schema = z.object({
  gridLines: z.array(
    z.object({
      price: z.number().positive(),
      quantity: z.number().positive(),
    }),
  ),
});
gridBot.runPolicy = {
  onTradeCompleted: true,
};

export type GridBotConfig = IBotConfiguration<z.infer<typeof gridBot.schema>>;
