import { xprisma } from "@innisfailures/db";
import type { SmartTradeWithOrders } from "@innisfailures/db";
import { logger } from "@innisfailures/logger";
import {
  parseSolanaPaperSymbol,
  runPaperSolanaQuotePipeline,
} from "@innisfailures/solana-execution";
import { XEntityType, XOrderType, XOrderStatus } from "@innisfailures/types";
import type { ISmartTradeExecutor, SmartTradeContext } from "../smart-trade-executor.interface.js";

/**
 * Paper Solana DEX path: Jupiter quote + DB updates only (no on-chain sends).
 * Supported: SmartTrade type Trade, entry Market, symbol `solana:<inMint>:<outMint>:<amountRaw>`.
 */
export class SolanaPaperTradeExecutor implements ISmartTradeExecutor {
  smartTrade: SmartTradeWithOrders;

  constructor(smartTrade: SmartTradeWithOrders) {
    this.smartTrade = smartTrade;
  }

  get status(): "Entering" | "Exiting" | "Finished" {
    return "Entering";
  }

  async cancelOrders(): Promise<number> {
    return 0;
  }

  async next(_ctx?: SmartTradeContext): Promise<boolean> {
    const entryOrder = this.smartTrade.orders.find((o) => o.entityType === XEntityType.EntryOrder);
    if (!entryOrder || entryOrder.status !== XOrderStatus.Idle) {
      return false;
    }

    if (entryOrder.type !== XOrderType.Market) {
      logger.warn(
        { smartTradeId: this.smartTrade.id },
        "Solana paper executor currently supports Market entry orders only.",
      );

      return false;
    }

    const parsed = parseSolanaPaperSymbol(this.smartTrade.symbol);
    if (!parsed) {
      logger.error(
        { symbol: this.smartTrade.symbol },
        'Invalid Solana paper symbol. Expected "solana:<inputMint>:<outputMint>:<amountRaw>".',
      );

      return false;
    }

    const settings = await xprisma.solanaChainSettings.findFirst();
    if (!settings?.paperMode) {
      logger.error("Solana paper SmartTrade requires SolanaChainSettings.paperMode=true.");

      return false;
    }

    const pipeline = await runPaperSolanaQuotePipeline({
      jupiterQuoteApiBase: settings.jupiterQuoteApiBase,
      defaultSlippageBps: settings.defaultSlippageBps,
      inputMint: parsed.inputMint,
      outputMint: parsed.outputMint,
      amount: parsed.amount,
    });

    await xprisma.policyAuditLog.create({
      data: {
        source: "rules",
        actionJson: JSON.stringify({
          kind: "solana_paper_quote",
          smartTradeId: this.smartTrade.id,
          orderId: entryOrder.id,
          rpcReserved: pipeline.rpcReservedForSimulation,
          message: pipeline.message,
          quote: pipeline.quote,
        }),
        applied: pipeline.ok,
      },
    });

    const quote = pipeline.quote as { outAmount?: string; inAmount?: string } | null;
    const outAmt = quote?.outAmount ? Number(quote.outAmount) : NaN;
    const inAmt = quote?.inAmount ? Number(quote.inAmount) : NaN;
    const syntheticPrice =
      Number.isFinite(outAmt) && Number.isFinite(inAmt) && inAmt !== 0 ? outAmt / inAmt : 1;

    const exchangeOrderId = `sol-paper-${this.smartTrade.id}-${entryOrder.id}-${Date.now()}`;

    await xprisma.order.update({
      where: { id: entryOrder.id },
      data: {
        status: XOrderStatus.Placed,
        exchangeOrderId,
        placedAt: new Date(),
      },
    });

    await xprisma.order.update({
      where: { id: entryOrder.id },
      data: {
        status: XOrderStatus.Filled,
        filledPrice: syntheticPrice,
        filledAt: new Date(),
      },
    });

    logger.info(
      {
        smartTradeId: this.smartTrade.id,
        orderId: entryOrder.id,
        exchangeOrderId,
      },
      "Solana paper market entry filled (synthetic price from quote ratio).",
    );

    return true;
  }
}
