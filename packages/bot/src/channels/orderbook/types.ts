import type { ExchangeCode, IOrderbook, MarketId } from "@innisfailures/types";

export type OrderbookEvent = {
  exchangeCode: ExchangeCode;
  marketId: MarketId;
  symbol: string;
  orderbook: IOrderbook;
};
