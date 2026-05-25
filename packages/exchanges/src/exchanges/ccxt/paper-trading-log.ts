import type { OrderWithSmartTrade } from "@innisfailures/db";
import { xprisma } from "@innisfailures/db";
import { XEntityType } from "@innisfailures/types";
import { parseCexSpotSymbol } from "./paper-ledger.js";

export type PaperLedgerDeltas = {
  base: string;
  quote: string;
  baseDelta: number;
  quoteDelta: number;
};

export type PaperSpotPnl = {
  quantity: number;
  costBasis: number;
  proceeds: number;
  grossPnl: number;
  netPnl: number;
  pnlPercent: number;
};

export type PaperSymbolBalances = {
  base: string;
  quote: string;
  baseBalance: number;
  quoteBalance: number;
};

function fmtNum(value: number, maxDecimals = 8): string {
  if (!Number.isFinite(value)) return String(value);
  const fixed = value.toFixed(maxDecimals);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return trimmed.length > 0 ? trimmed : "0";
}

export function paperLedgerDeltas(params: {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  filledPrice: number;
  fee?: number;
}): PaperLedgerDeltas | null {
  const parsed = parseCexSpotSymbol(params.symbol);
  if (!parsed) return null;

  const fee = params.fee ?? 0;
  const grossQuote = params.quantity * params.filledPrice;

  if (params.side === "buy") {
    return {
      base: parsed.base,
      quote: parsed.quote,
      baseDelta: params.quantity,
      quoteDelta: -(grossQuote + fee),
    };
  }

  return {
    base: parsed.base,
    quote: parsed.quote,
    baseDelta: -params.quantity,
    quoteDelta: grossQuote - fee,
  };
}

export function computeLongSpotPnl(params: {
  entryPrice: number;
  entryQuantity: number;
  exitPrice: number;
  exitQuantity: number;
  entryFee?: number;
  exitFee?: number;
}): PaperSpotPnl {
  const quantity = Math.min(params.entryQuantity, params.exitQuantity);
  const entryFee = params.entryFee ?? 0;
  const exitFee = params.exitFee ?? 0;
  const costBasis = params.entryPrice * quantity + entryFee;
  const proceeds = params.exitPrice * quantity - exitFee;
  const grossPnl = (params.exitPrice - params.entryPrice) * quantity;
  const netPnl = proceeds - costBasis;
  const pnlPercent = costBasis !== 0 ? (netPnl / costBasis) * 100 : 0;

  return {
    quantity,
    costBasis,
    proceeds,
    grossPnl,
    netPnl,
    pnlPercent,
  };
}

export async function getPaperSymbolBalances(symbol: string): Promise<PaperSymbolBalances | null> {
  const parsed = parseCexSpotSymbol(symbol);
  if (!parsed) return null;

  const rows = await xprisma.paperAsset.findMany({
    where: { currency: { in: [parsed.base, parsed.quote] } },
  });

  const baseRow = rows.find((row) => row.currency === parsed.base);
  const quoteRow = rows.find((row) => row.currency === parsed.quote);

  return {
    base: parsed.base,
    quote: parsed.quote,
    baseBalance: baseRow?.balance ?? 0,
    quoteBalance: quoteRow?.balance ?? 0,
  };
}

export function formatPaperCexFill(params: {
  exchangeCode: string;
  orderId: number | string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  filledPrice: number;
  fee?: number;
  balances?: PaperSymbolBalances | null;
}): string {
  const fee = params.fee ?? 0;
  const notional = params.quantity * params.filledPrice;
  const deltas = paperLedgerDeltas({
    symbol: params.symbol,
    side: params.side,
    quantity: params.quantity,
    filledPrice: params.filledPrice,
    fee,
  });

  const sideLabel = params.side.toUpperCase();
  const lines = [
    `[${params.exchangeCode} Paper] ${sideLabel} filled | order #${params.orderId} | ${params.symbol}`,
    `  qty ${fmtNum(params.quantity)} @ ${fmtNum(params.filledPrice)} → notional ${fmtNum(notional)}${deltas ? ` ${deltas.quote}` : ""} | fee ${fmtNum(fee)}`,
  ];

  if (deltas) {
    const balanceImpact =
      params.side === "buy"
        ? `+${fmtNum(deltas.baseDelta)} ${deltas.base}, ${fmtNum(deltas.quoteDelta)} ${deltas.quote}`
        : `${fmtNum(deltas.baseDelta)} ${deltas.base}, +${fmtNum(deltas.quoteDelta)} ${deltas.quote}`;
    lines.push(`  balance Δ ${balanceImpact}`);
  }

  if (params.balances) {
    lines.push(
      `  balances ${fmtNum(params.balances.baseBalance)} ${params.balances.base} | ${fmtNum(params.balances.quoteBalance)} ${params.balances.quote}`,
    );
  }

  return lines.join("\n");
}

export async function formatPaperSmartTradeFill(params: {
  exchangeCode: string;
  order: OrderWithSmartTrade;
  filledPrice: number;
  fee?: number;
}): Promise<string | null> {
  const parsed = parseCexSpotSymbol(params.order.symbol);
  if (!parsed) return null;

  const { order } = params;
  const fee = params.fee ?? 0;
  const notional = order.quantity * params.filledPrice;
  const balances = await getPaperSymbolBalances(order.symbol);

  const lines = [
    `[${params.exchangeCode} Paper] ${order.entityType} filled | SmartTrade #${order.smartTrade.id} | order #${order.id}`,
    `  ${order.side} ${fmtNum(order.quantity)} ${parsed.base} @ ${fmtNum(params.filledPrice)} ${parsed.quote} | notional ${fmtNum(notional)} ${parsed.quote} | fee ${fmtNum(fee)}`,
  ];

  if (balances) {
    lines.push(
      `  balances ${fmtNum(balances.baseBalance)} ${balances.base} | ${fmtNum(balances.quoteBalance)} ${balances.quote}`,
    );
  }

  const isExit =
    order.entityType === XEntityType.TakeProfitOrder || order.entityType === XEntityType.StopLossOrder;

  if (isExit) {
    const entryOrder = await xprisma.order.findFirst({
      where: {
        smartTradeId: order.smartTradeId,
        entityType: XEntityType.EntryOrder,
        status: "Filled",
      },
    });

    if (entryOrder?.filledPrice != null) {
      const pnl = computeLongSpotPnl({
        entryPrice: entryOrder.filledPrice,
        entryQuantity: entryOrder.quantity,
        exitPrice: params.filledPrice,
        exitQuantity: order.quantity,
        entryFee: entryOrder.fee ?? 0,
        exitFee: fee,
      });

      const sign = pnl.netPnl >= 0 ? "+" : "";
      lines.push(
        `  round-trip cost ${fmtNum(pnl.costBasis)} ${parsed.quote} → proceeds ${fmtNum(pnl.proceeds)} ${parsed.quote}`,
        `  P&L gross ${sign}${fmtNum(pnl.grossPnl)} ${parsed.quote} | net ${sign}${fmtNum(pnl.netPnl)} ${parsed.quote} (${sign}${fmtNum(pnl.pnlPercent, 2)}%)`,
      );
    }
  } else if (order.entityType === XEntityType.EntryOrder) {
    lines.push(`  position opened (exit pending)`);
  }

  return lines.join("\n");
}
