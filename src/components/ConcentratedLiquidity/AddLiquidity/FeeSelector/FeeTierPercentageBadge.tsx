import React from 'react';
import { PoolState } from 'src/hooks/concentratedLiquidity/hooks/types';
import { BlackBox, BlackBoxContent } from './styles';
import { FeeTierPercentageBadgeProps } from './types';

export function FeeTierPercentageBadge({ feeAmount, distributions, poolState }: FeeTierPercentageBadgeProps) {
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
