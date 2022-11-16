import { Token } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useAllTokenBalances } from 'src/state/pwallet/hooks';
import { getTokenComparator } from 'src/utils';

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
