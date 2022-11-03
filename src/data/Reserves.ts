import { Interface } from '@ethersproject/abi';
import IPangolinPair from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json';
import { ChainId, Currency, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useChainId } from 'src/hooks';
import { nearFn } from 'src/utils/near';
import { useMultipleContractSingleData } from '../state/pmulticall/hooks';
import { wrappedCurrency } from '../utils/wrappedCurrency';
import { usePairsHook } from './multiChainsHooks';

const PAIR_INTERFACE = new Interface(IPangolinPair.abi);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export enum PoolType {
  SIMPLE_POOL = 'SIMPLE_POOL',
  STABLE_SWAP = 'STABLE_SWAP',
  RATED_SWAP = 'RATED_SWAP',
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const chainId = useChainId();

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  );

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB, chainId ? chainId : ChainId.AVALANCHE)
          : undefined;
      }),
    [tokens, chainId],
  );

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves');

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result;
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          chainId ? chainId : ChainId.AVALANCHE,
        ),
      ];
    });
  }, [results, tokens, chainId]);
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  const chainId = useChainId();

  const tokens: [Currency | undefined, Currency | undefined][] = useMemo(() => [[tokenA, tokenB]], [tokenA, tokenB]);

  const usePairs_ = usePairsHook[chainId];
  return usePairs_(tokens)[0];
}

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
