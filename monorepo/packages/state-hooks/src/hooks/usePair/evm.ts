import { parseUnits } from '@ethersproject/units';
import { ChainId, Currency, Pair, TokenAmount } from '@pangolindex/sdk';
import { PAIR_INTERFACE, PairState, useChainId, useSubgraphPairs, wrappedCurrency } from '@pangolindex/shared';
import { useMemo } from 'react';
import { useMultipleContractSingleData, useShouldUseSubgraph } from 'src/state';
import { usePairsHook } from '.';

export function usePairsContract(
  currencies: [Currency | undefined, Currency | undefined][],
): [PairState, Pair | null][] {
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

export function usePairsViaSubgraph(
  currencies: [Currency | undefined, Currency | undefined][],
): [PairState, Pair | null][] {
  const chainId = useChainId();

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  );

  // prepare pair addresses for given tokens using sdk
  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB, chainId ? chainId : ChainId.AVALANCHE)
          : undefined;
      }),
    [tokens, chainId],
  );

  // get pairs from subgraph
  const results = useSubgraphPairs(pairAddresses);

  // create pair reserve mapping
  // pair_address => { reserve0, reserve1 }
  const pairReserves = useMemo(() => {
    return (results?.data || []).reduce((memo, result) => {
      memo[result?.id] = {
        reserve0: parseUnits(result?.reserve0, result?.token0?.decimals).toString(),
        reserve1: parseUnits(result?.reserve1, result?.token1?.decimals).toString(),
      };

      return memo;
    }, {} as { [id: string]: { reserve0: string; reserve1: string } });
  }, [results?.data, results?.isLoading]);

  return useMemo(() => {
    return pairAddresses.map((result, i) => {
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (results?.isLoading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!pairReserves || !result || !pairReserves[result]) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = pairReserves[result];
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
  }, [results, tokens, chainId, results?.data, results?.isLoading, pairReserves]);
}

/**
 * its wrapper hook to check which hook need to use based on subgraph on off
 * @param currencies
 * @returns
 */
export function usePairs(currencies: [Currency | undefined, Currency | undefined][]) {
  const shouldUseSubgraph = useShouldUseSubgraph();
  const useHook = shouldUseSubgraph ? usePairsViaSubgraph : usePairsContract;
  const res = useHook(currencies);
  return res;
}
