import type { ExchangeAccountWithCredentials, SmartTradeWithOrders } from "@innisfailures/db";
import { xprisma } from "@innisfailures/db";
import { exchangeProvider } from "@innisfailures/exchanges";
import { EXECUTION_VENUES, XSmartTradeType } from "@innisfailures/types";
import type { ISmartTradeExecutor } from "./smart-trade-executor.interface.js";
import { TradeExecutor } from "./trade/trade.executor.js";
import { ArbExecutor } from "./arb/arb.executor.js";
import { DcaExecutor } from "./dca/dca.executor.js";
import { SolanaPaperTradeExecutor } from "./solana-paper/solana-paper-trade.executor.js";

const SOLANA_DEX = EXECUTION_VENUES[1];

/**
 * Combine all type of SmartTrades into one executor.
 */
export class SmartTradeExecutor {
  static create(
    smartTrade: SmartTradeWithOrders,
    exchangeAccount: ExchangeAccountWithCredentials,
  ): ISmartTradeExecutor {
    const exchange = exchangeProvider.fromAccount(exchangeAccount);

    if (smartTrade.bot?.executionVenue === SOLANA_DEX && (smartTrade.type as XSmartTradeType) !== "Trade") {
      throw new Error(
        `Solana DEX execution venue supports SmartTrade type "Trade" only (got "${smartTrade.type}").`,
      );
    }

    switch (smartTrade.type as XSmartTradeType) {
      case "Trade":
        if (smartTrade.bot?.executionVenue === SOLANA_DEX) {
          return new SolanaPaperTradeExecutor(smartTrade);
        }

        return new TradeExecutor(smartTrade, exchange);
      case "ARB":
        return new ArbExecutor(smartTrade);
      case "DCA":
        return new DcaExecutor(smartTrade, exchange);
      default:
        throw new Error(`Unknown SmartTrade type: ${smartTrade.type}`);
    }
  }

  static async fromId(id: number): Promise<ISmartTradeExecutor> {
    const smartTrade = await xprisma.smartTrade.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        orders: true,
        exchangeAccount: true,
        bot: true,
      },
    });
    const exchange = exchangeProvider.fromAccount(smartTrade.exchangeAccount);

    if (smartTrade.bot?.executionVenue === SOLANA_DEX && (smartTrade.type as XSmartTradeType) !== "Trade") {
      throw new Error(
        `Solana DEX execution venue supports SmartTrade type "Trade" only (got "${smartTrade.type}").`,
      );
    }

    switch (smartTrade.type as XSmartTradeType) {
      case "Trade":
        if (smartTrade.bot?.executionVenue === SOLANA_DEX) {
          return new SolanaPaperTradeExecutor(smartTrade);
        }

        return new TradeExecutor(smartTrade, exchange);
      case "ARB":
        return new ArbExecutor(smartTrade);
      case "DCA":
        return new DcaExecutor(smartTrade, exchange);
      default:
        throw new Error(`Unknown SmartTrade type: ${smartTrade.type}`);
    }
  }
}
