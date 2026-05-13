import type { ExchangeCode, ITrade, MarketId } from "@innisfailures/types";

export type TradeEvent = {
  exchangeCode: ExchangeCode;
  marketId: MarketId;
  symbol: string;
  trade: ITrade;
};
