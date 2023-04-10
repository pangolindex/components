import { ConcentratedPool, Currency, FeeAmount, TICK_SPACINGS, TickMath, nearestUsableTick } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useChainId } from 'src/hooks';
import { Bound } from 'src/state/pmint/concentratedLiquidity/atom';
import { PoolState } from './types';
import { usePoolsHook } from './index';

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): [PoolState, ConcentratedPool | null] {
  const chainId = useChainId();
  const usePools = usePoolsHook[chainId];

  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  );

  const pools = usePools(poolKeys);

  return pools?.[0];
}

export default function useIsTickAtLimit(
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
) {
  return useMemo(
    () => ({
      [Bound.LOWER]:
        feeAmount && tickLower
          ? tickLower === nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount as FeeAmount])
          : undefined,
      [Bound.UPPER]:
        feeAmount && tickUpper
          ? tickUpper === nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount as FeeAmount])
          : undefined,
    }),
    [feeAmount, tickLower, tickUpper],
  );
}
