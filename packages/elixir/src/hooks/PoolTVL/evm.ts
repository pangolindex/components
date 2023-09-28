import { useFeeTierDistributionQuery } from '@honeycomb-finance/shared';
import { useBlockNumber } from '@honeycomb-finance/state-hooks';
import { FeeAmount, Token } from '@pangolindex/sdk';

import { useMemo } from 'react';

// maximum number of blocks past which we consider the data stale
const MAX_DATA_BLOCK_AGE = 20;

export function usePoolTVL(token0: Token | undefined, token1: Token | undefined) {
  const latestBlock = useBlockNumber();
  const { isLoading, error, data } = useFeeTierDistributionQuery(token0?.address, token1?.address, 30000);

  const { asToken0, asToken1, _meta } = data ?? {};

  return useMemo(() => {
    if (!latestBlock || !_meta || !asToken0 || !asToken1) {
      return {
        isLoading,
        error,
      };
    }

    if (latestBlock - (_meta?.block?.number ?? 0) > MAX_DATA_BLOCK_AGE) {
      console.log(`Graph stale (latest block: ${latestBlock})`);
      return {
        isLoading,
        error,
      };
    }

    const all = asToken0.concat(asToken1);

    // sum tvl for token0 and token1 by fee tier
    const tvlByFeeTier = all.reduce<{ [feeAmount: number]: [number | undefined, number | undefined] }>(
      (acc, value) => {
        acc[value.feeTier][0] = (acc[value.feeTier][0] ?? 0) + Number(value.totalValueLockedToken0);
        acc[value.feeTier][1] = (acc[value.feeTier][1] ?? 0) + Number(value.totalValueLockedToken1);
        return acc;
      },
      {
        [FeeAmount.LOWEST]: [undefined, undefined],
        [FeeAmount.LOW]: [undefined, undefined],
        [FeeAmount.MEDIUM]: [undefined, undefined],
        [FeeAmount.HIGH]: [undefined, undefined],
      } as Record<FeeAmount, [number | undefined, number | undefined]>,
    );
    // const tvlByFeeTier = {};
    // sum total tvl for token0 and token1
    const [sumToken0Tvl, sumToken1Tvl] = Object.values(tvlByFeeTier).reduce(
      (acc: [number, number], value: any) => {
        acc[0] += value[0] ?? 0;
        acc[1] += value[1] ?? 0;
        return acc;
      },
      [0, 0],
    );

    // returns undefined if both tvl0 and tvl1 are undefined (pool not created)
    const mean = (tvl0: number | undefined, sumTvl0: number, tvl1: number | undefined, sumTvl1: number) =>
      tvl0 === undefined && tvl1 === undefined ? undefined : ((tvl0 ?? 0) + (tvl1 ?? 0)) / (sumTvl0 + sumTvl1) || 0;

    const distributions: Record<FeeAmount, number | undefined> = {
      [FeeAmount.LOWEST]: mean(
        tvlByFeeTier[FeeAmount.LOWEST][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOWEST][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW]: mean(tvlByFeeTier[FeeAmount.LOW][0], sumToken0Tvl, tvlByFeeTier[FeeAmount.LOW][1], sumToken1Tvl),
      [FeeAmount.MEDIUM]: mean(
        tvlByFeeTier[FeeAmount.MEDIUM][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.MEDIUM][1],
        sumToken1Tvl,
      ),
      [FeeAmount.HIGH]: mean(
        tvlByFeeTier[FeeAmount.HIGH][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.HIGH][1],
        sumToken1Tvl,
      ),
    };

    return {
      isLoading,
      error,
      distributions,
    };
  }, [_meta, asToken0, asToken1, isLoading, error, latestBlock]);
}
