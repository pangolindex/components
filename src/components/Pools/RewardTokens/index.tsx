import { Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { Box, CurrencyLogo } from 'src/components';
import { LogoSize } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';

interface RewardTokensLogoProps {
  size?: LogoSize;
  rewardTokens?: Array<Token | null | undefined> | null;
}

export default function RewardTokens({ rewardTokens = [], size = 24 }: RewardTokensLogoProps) {
  const chainId = useChainId();
  const png = PNG[chainId];

  const tokens = useMemo(() => {
    if (!rewardTokens) {
      return [];
    }
    // add png in first position
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
}
