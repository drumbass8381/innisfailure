import { exchangeProvider } from "@innisfailures/exchanges";
import { decomposeSymbolId } from "@innisfailures/tools";
import type { Context } from "../../../../utils/context.js";
import type { TGetSymbolPriceInputSchema } from "./schema.js";

type Options = {
  ctx: Context;
  input: TGetSymbolPriceInputSchema;
};

export async function getSymbolPrice(opts: Options) {
  const { input } = opts;

  const { exchangeCode, currencyPairSymbol } = decomposeSymbolId(
    input.symbolId,
  );
  const exchangeService = exchangeProvider.fromCode(exchangeCode);

  const price = await exchangeService.getMarketPrice({
    symbol: currencyPairSymbol,
  });

  return price;
}
