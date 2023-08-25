import { Text } from '@pangolindex/core';
import { useTranslation } from '@pangolindex/shared';
import React from 'react';
import { PoolState } from 'src/hooks/types';
import { BlackBox } from './styles';
import { FeeTierPercentageBadgeProps } from './types';

export function FeeTierPercentageBadge({ feeAmount, distributions, poolState }: FeeTierPercentageBadgeProps) {
  const { t } = useTranslation();
  return (
    <BlackBox mt={'5px'}>
      <Text color="color11" fontSize={'9px'} fontWeight={500}>
        {!distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID
          ? `${t('elixir.feeTier.notCreated')}`
          : distributions[feeAmount] !== undefined
          ? `${distributions[feeAmount]?.toFixed(0)}% ${t('elixir.feeTier.selectedPercentage')}`
          : `${t('elixir.feeTier.noData')}`}
      </Text>
    </BlackBox>
  );
}
