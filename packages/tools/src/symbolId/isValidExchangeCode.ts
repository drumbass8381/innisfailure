import { ExchangeCode } from "@innisfailures/types";

export function isValidExchangeCode(exchangeCode: ExchangeCode) {
  return Object.keys(ExchangeCode).includes(exchangeCode);
}
