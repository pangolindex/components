import { getTokenComparator } from '@honeycomb-finance/shared';
import { BridgeCurrency, Token } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useAllTokenBalances } from '..';

type SortCurrency = Token | BridgeCurrency;

export function useTokenComparator(inverted: boolean): (tokenA: SortCurrency, tokenB: SortCurrency) => number {
  const balances = useAllTokenBalances();
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balances]);
  return useMemo(() => {
    if (inverted) {
      return (tokenA: SortCurrency, tokenB: SortCurrency) => comparator(tokenA, tokenB) * -1;
    } else {
      return comparator;
    }
  }, [inverted, comparator]);
}
