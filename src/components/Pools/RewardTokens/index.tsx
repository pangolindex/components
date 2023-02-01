import { Token } from '@pangolindex/sdk';
import React from 'react';
import styled from 'styled-components';
import { CurrencyLogo } from 'src/components';
import { LogoSize } from 'src/constants';

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`;

interface RewardTokensLogoProps {
  margin?: boolean;
  size?: LogoSize;
  rewardTokens?: Array<Token | null | undefined> | null;
}

const CoveredLogo = styled(CurrencyLogo)`
  position: absolute;
`;

export default function RewardTokens({ rewardTokens = [], size = 24, margin = false }: RewardTokensLogoProps) {
  const tokens = rewardTokens || []; // add PNG as default reward

  return (
    <Wrapper sizeraw={size} margin={margin}>
      {(tokens || []).map((token, i) => {
        return <CoveredLogo key={i} currency={token as Token} size={size} imageSize={48} />;
      })}
    </Wrapper>
  );
}
