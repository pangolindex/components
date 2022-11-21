import { Currency, CurrencyAmount, Pair, Percent, Token, Trade } from '@pangolindex/sdk';
import flatMap from 'lodash.flatmap';
import { useMemo } from 'react';
import { BASES_TO_CHECK_TRADES_AGAINST, BIPS_BASE, CUSTOM_BASES } from 'src/constants';
import { PairState } from 'src/data/Reserves';
import { usePairsHook } from 'src/data/multiChainsHooks';
import { useChainId } from 'src/hooks';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { useDaasFeeInfo, useDaasFeeTo } from '../state/pswap/hooks';

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): { pairs: Pair[]; isLoading: boolean } {
  const chainId = useChainId();

  const usePairs = usePairsHook[chainId];

  const bases: Token[] = chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []; // eslint-disable-line react-hooks/exhaustive-deps

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined];

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address,
      ),
    [bases],
  );

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true;
              const customBases = CUSTOM_BASES[chainId];
              if (!customBases) return true;

              const customBasesA: Token[] | undefined = customBases[tokenA.address];
              const customBasesB: Token[] | undefined = customBases[tokenB.address];

              if (!customBasesA && !customBasesB) return true;

              if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false;
              if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false;

              return true;
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  );

  const allPairs = usePairs(allPairCombinations);

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(() => {
    const pairs: Pair[] = Object.values(
      allPairs
        // filter out invalid pairs
        .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
        // filter out duplicated pairs
        .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
          memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr;
          return memo;
        }, {}),
    );
    const isLoading = allPairs.some((result): result is [PairState, Pair] => result[0] === PairState.LOADING);
    return { pairs, isLoading };
  }, [allPairs]);
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
): { trade: Trade | null; isLoading: boolean } {
  const { pairs: allowedPairs, isLoading } = useAllCommonPairs(currencyAmountIn?.currency, currencyOut);
  const [feeTo] = useDaasFeeTo();
  const [feeInfo] = useDaasFeeInfo();

  return useMemo(() => {
    if (currencyAmountIn && currencyOut && feeTo && feeInfo && allowedPairs.length > 0 && !isLoading) {
      const trade = Trade.bestTradeExactIn(
        allowedPairs,
        currencyAmountIn,
        currencyOut,
        { maxHops: 3, maxNumResults: 1 },
        { fee: new Percent(feeInfo.feeTotal.toString(), BIPS_BASE), feeTo },
      )[0];
      return { trade: trade ?? null, isLoading: false };
    }
    return { trade: null, isLoading: true };
  }, [allowedPairs, isLoading, currencyAmountIn, currencyOut, feeTo, feeInfo]);
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
): { trade: Trade | null; isLoading: boolean } {
  const { pairs: allowedPairs, isLoading } = useAllCommonPairs(currencyIn, currencyAmountOut?.currency);
  const [feeTo] = useDaasFeeTo();
  const [feeInfo] = useDaasFeeInfo();

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && feeTo && feeInfo && allowedPairs.length > 0 && !isLoading) {
      const trade = Trade.bestTradeExactOut(
        allowedPairs,
        currencyIn,
        currencyAmountOut,
        { maxHops: 3, maxNumResults: 1 },
        { fee: new Percent(feeInfo.feeTotal.toString(), BIPS_BASE), feeTo },
      )[0];
      return { trade: trade ?? null, isLoading: false };
    }
    return { trade: null, isLoading: true };
  }, [allowedPairs, isLoading, currencyIn, currencyAmountOut, feeTo, feeInfo]);
}
