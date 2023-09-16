import { PNG, useChainId } from '@honeycomb-finance/shared';
import { Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { Box } from '../Box';
import CurrencyLogo from '../CurrencyLogo';
import { RewardTokensProps } from './types';

const RewardTokens = ({ showNativeRewardToken = true, rewardTokens = [], size = 24 }: RewardTokensProps) => {
  const chainId = useChainId();
  const png = PNG[chainId];

  const tokens = useMemo(() => {
    if (!rewardTokens) {
      return [];
    }
    const filteredTokens = rewardTokens.filter((token) => !!token && !token.equals(png));
    if (showNativeRewardToken) return [png, ...filteredTokens];
    else return filteredTokens;
  }, [rewardTokens]);

  return (
    <Box display="flex" width="100%" style={{ gap: '5px' }}>
      {(tokens || []).map((token, i) => {
        return <CurrencyLogo key={i} currency={token as Token} size={size} imageSize={48} />;
      })}
    </Box>
  );
};

export default RewardTokens;
