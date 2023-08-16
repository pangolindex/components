import { BridgeCurrency } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useAllTokenBalances } from '@pangolindex/state-hooks';
import { getTokenComparator } from '@pangolindex/shared';

export function useTokenComparator(inverted: boolean): (tokenA: BridgeCurrency, tokenB: BridgeCurrency) => number {
  const balances = useAllTokenBalances();
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balances]);
  return useMemo(() => {
    if (inverted) {
      return (tokenA: BridgeCurrency, tokenB: BridgeCurrency) => comparator(tokenA, tokenB) * -1;
    } else {
      return comparator;
    }
  }, [inverted, comparator]);
}
