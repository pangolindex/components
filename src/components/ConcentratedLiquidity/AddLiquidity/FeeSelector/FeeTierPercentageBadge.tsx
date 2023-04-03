import { FeeAmount } from '@pangolindex/sdk';
import React from 'react';
import { PoolState, useFeeTierDistribution } from 'src/hooks/concentratedLiquidity/hooks';
import { BlackBox, BlackBoxContent } from './styles';

export function FeeTierPercentageBadge({
  feeAmount,
  distributions,
  poolState,
}: {
  feeAmount: FeeAmount;
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions'];
  poolState: PoolState;
}) {
  return (
    <BlackBox mt={'5px'}>
      <BlackBoxContent color="color11" fontSize={10} fontWeight={500}>
        {!distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID
          ? 'Not created'
          : distributions[feeAmount] !== undefined
          ? `${distributions[feeAmount]?.toFixed(0)}% select`
          : `No data`}
      </BlackBoxContent>
    </BlackBox>
  );
}
