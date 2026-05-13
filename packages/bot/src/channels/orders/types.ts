import type { OrderWithSmartTrade } from "@innisfailures/db";
import type { ExchangeCode, IWatchOrder } from "@innisfailures/types";

export type OrderEventType = "onFilled" | "onCanceled" | "onPlaced";

export type Subscription = {
  event: OrderEventType;
  callback: (exchangeOrder: IWatchOrder, order: OrderWithSmartTrade, exchangeCode: ExchangeCode) => void;
};
