import { Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { Box, CurrencyLogo } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { RewardTokensProps } from './types';

const RewardTokens = ({ rewardTokens = [], size = 24 }: RewardTokensProps) => {
  const chainId = useChainId();
  const png = PNG[chainId];

  const tokens = useMemo(() => {
    if (!rewardTokens) {
      return [];
    }
    const filteredTokens = rewardTokens.filter((token) => !!token && !token.equals(png));
    return [png, ...filteredTokens];
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
