import { Token } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useAllTokenBalances } from 'src/state/pwallet/hooks';
import { getTokenComparator } from 'src/utils';

export function useTokenComparator(inverted: boolean, firstTokens?: Token[]): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances();
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balances]);
  return useMemo(() => {
    // if firstToken add firstToken in top of array
    if (firstTokens) {
      return (tokenA: Token, tokenB: Token) => {
        const firstTokenIndex = firstTokens.findIndex((t) => t.address === tokenA.address);
        const secondTokenIndex = firstTokens.findIndex((t) => t.address === tokenB.address);
        if (firstTokenIndex !== -1 || secondTokenIndex !== -1) {
          return secondTokenIndex - firstTokenIndex;
        }
        return comparator(tokenA, tokenB) * (inverted ? -1 : 1);
      };
    }
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1;
    } else {
      return comparator;
    }
  }, [inverted, firstTokens, comparator]);
}
