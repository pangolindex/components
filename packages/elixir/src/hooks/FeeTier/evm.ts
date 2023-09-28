import { useChainId, wrappedCurrency } from '@honeycomb-finance/shared';
import { Currency, FeeAmount } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { usePoolTVL } from '../PoolTVL/evm';
import { usePool } from '../common';
import { FeeTierDistribution, PoolState } from '../types';

export function useFeeTierDistribution(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): FeeTierDistribution {
  const chainId = useChainId();
  const tokenA = wrappedCurrency(currencyA, chainId);
  const tokenB = wrappedCurrency(currencyB, chainId);

  const { isLoading, error, distributions } = usePoolTVL(tokenA, tokenB);

  // fetch all pool states to determine pool state
  const [poolStateVeryLow] = usePool(currencyA, currencyB, FeeAmount.LOWEST);
  const [poolStateLow] = usePool(currencyA, currencyB, FeeAmount.LOW);
  const [poolStateMedium] = usePool(currencyA, currencyB, FeeAmount.MEDIUM);
  const [poolStateHigh] = usePool(currencyA, currencyB, FeeAmount.HIGH);

  return useMemo(() => {
    if (isLoading || error || !distributions) {
      return {
        isLoading,
        isError: !!error,
        distributions,
      };
    }

    const largestUsageFeeTier = Object.keys(distributions)
      .map((d) => Number(d))
      .filter((d: FeeAmount) => distributions[d] !== 0 && distributions[d] !== undefined)
      .reduce((a: FeeAmount, b: FeeAmount) => ((distributions[a] ?? 0) > (distributions[b] ?? 0) ? a : b), -1);

    const percentages =
      !isLoading &&
      !error &&
      distributions &&
      poolStateVeryLow !== PoolState.LOADING &&
      poolStateLow !== PoolState.LOADING &&
      poolStateMedium !== PoolState.LOADING &&
      poolStateHigh !== PoolState.LOADING
        ? {
            [FeeAmount.LOWEST]:
              poolStateVeryLow === PoolState.EXISTS ? (distributions[FeeAmount.LOWEST] ?? 0) * 100 : undefined,
            [FeeAmount.LOW]: poolStateLow === PoolState.EXISTS ? (distributions[FeeAmount.LOW] ?? 0) * 100 : undefined,
            [FeeAmount.MEDIUM]:
              poolStateMedium === PoolState.EXISTS ? (distributions[FeeAmount.MEDIUM] ?? 0) * 100 : undefined,
            [FeeAmount.HIGH]:
              poolStateHigh === PoolState.EXISTS ? (distributions[FeeAmount.HIGH] ?? 0) * 100 : undefined,
          }
        : undefined;

    return {
      isLoading,
      isError: !!error,
      distributions: percentages,
      largestUsageFeeTier: largestUsageFeeTier === -1 ? undefined : largestUsageFeeTier,
    };
  }, [isLoading, error, distributions, poolStateVeryLow, poolStateLow, poolStateMedium, poolStateHigh]);
}
