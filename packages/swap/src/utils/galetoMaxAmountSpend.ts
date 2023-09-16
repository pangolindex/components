import { MIN_ETH } from '@honeycomb-finance/shared';
import { CAVAX, ChainId, CurrencyAmount, JSBI } from '@pangolindex/sdk';
import { Currency, CurrencyAmount as UniCurrencyAmount } from '@uniswap/sdk-core';

export function galetoMaxAmountSpend(chainId: ChainId, currencyAmount?: UniCurrencyAmount<Currency>): any | undefined {
  if (!currencyAmount) return undefined;
  if (chainId && currencyAmount.currency === CAVAX[chainId]) {
    if (JSBI.greaterThan(currencyAmount.numerator, MIN_ETH)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.numerator, MIN_ETH), chainId);
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0), chainId);
    }
  }
  return currencyAmount;
}
