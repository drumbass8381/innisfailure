import { xprisma } from "@innisfailures/db";

type PaperTx = Parameters<Parameters<typeof xprisma.$transaction>[0]>[0];

export function parseCexSpotSymbol(symbol: string): { base: string; quote: string } | null {
  const [base, quote] = symbol.split("/");
  if (!base || !quote) return null;

  return { base, quote };
}

/**
 * Adjust PaperAsset balances after a simulated CEX fill (spot).
 * Buy: +base, −(cost + fee in quote). Sell: −base, +(proceeds − fee in quote).
 */
export async function applyCexPaperFillLedger(
  tx: PaperTx,
  params: {
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    filledPrice: number;
    fee?: number;
  },
): Promise<void> {
  const parsed = parseCexSpotSymbol(params.symbol);
  if (!parsed) return;

  const fee = params.fee ?? 0;
  const { base, quote } = parsed;
  const grossQuote = params.quantity * params.filledPrice;

  const adjust = async (currency: string, delta: number) => {
    const row = await tx.paperAsset.findUnique({ where: { currency } });
    const next = (row?.balance ?? 0) + delta;
    await tx.paperAsset.upsert({
      where: { currency },
      create: { currency, balance: next },
      update: { balance: next },
    });
  };

  if (params.side === "buy") {
    await adjust(base, params.quantity);
    await adjust(quote, -(grossQuote + fee));
  } else {
    await adjust(base, -params.quantity);
    await adjust(quote, grossQuote - fee);
  }
}
