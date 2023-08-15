import { Token } from '@pangolindex/sdk';
import { getTokenComparator } from '@pangolindex/shared';
import { useAllTokenBalances } from '@pangolindex/state-hooks';
import { useMemo } from 'react';

export function useTokenComparator(inverted: boolean): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances();
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balances]);
  return useMemo(() => {
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1;
    } else {
      return comparator;
    }
  }, [inverted, comparator]);
}
