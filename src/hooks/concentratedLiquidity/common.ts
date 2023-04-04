import { ConcentratedPool, Currency, FeeAmount } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useChainId } from 'src/hooks';
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
