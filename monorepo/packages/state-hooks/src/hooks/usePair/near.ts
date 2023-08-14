import { ChainId, Currency, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { PairState, PoolType, nearFn, useChainId, wrappedCurrency } from '@pangolindex/shared';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

export function useGetNearAllPool() {
  const chainId = useChainId();
  return useQuery(['get-near-pools'], async () => {
    return nearFn.getAllPools(chainId);
  });
}

export function useNearPairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const chainId = useChainId();

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  );

  const allPools = useGetNearAllPool();

  return useMemo(() => {
    if (allPools && !allPools.isLoading && tokens) {
      const results = allPools.data || [];

      return tokens.map(([tokenA, tokenB]) => {
        let indexOfToken0 = 0;
        let indexOfToken1 = 1;
        let reserveAmounts = [] as any;

        if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];

        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];

        const filterResults = results.filter((v) => {
          if (v?.pool_kind !== PoolType.SIMPLE_POOL) return false;

          const tokenIds = v?.token_account_ids || [];

          if (tokenIds.includes(token0?.address) && tokenIds.includes(token1?.address)) {
            return true;
          }
        });

        const result = filterResults?.[0];

        if (result) {
          const tokenIds = result.token_account_ids || [];
          indexOfToken0 = tokenIds.findIndex((element) => element.includes(token0?.address));
          indexOfToken1 = tokenIds.findIndex((element) => element.includes(token1?.address));
          reserveAmounts = result.amounts || [];
        }

        if (reserveAmounts.length === 0) return [PairState.NOT_EXISTS, null];

        return [
          PairState.EXISTS,
          new Pair(
            new TokenAmount(token0, reserveAmounts[indexOfToken0].toString()),
            new TokenAmount(token1, reserveAmounts[indexOfToken1].toString()),
            chainId ? chainId : ChainId.AVALANCHE,
          ),
        ];
      });
    }

    return [[PairState.LOADING, null]];
  }, [allPools?.data, allPools?.isLoading, tokens, chainId]);
}

export function useGetNearPoolId(tokenA?: Token, tokenB?: Token): number | null {
  const allPools = useGetNearAllPool();
  return useMemo(() => {
    if (!allPools?.isLoading) {
      const results = allPools?.data || [];

      return results.findIndex((element) => {
        if (element?.pool_kind !== PoolType.SIMPLE_POOL) return false;

        const tokenIds = element?.token_account_ids || [];

        if (tokenIds.includes(tokenA?.address) && tokenIds.includes(tokenB?.address)) {
          return true;
        }

        return false;
      });
    }
    return null;
  }, [allPools?.data, allPools?.isLoading, tokenA, tokenB]);
}
