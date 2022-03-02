import { CAVAX, Currency, Token, ChainId } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import React, { useMemo } from 'react';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
import { AvaxLogo } from '../AvaxLogo';
import { WgmLogo } from '../WgmLogo';
import { StyledLogo } from './styles';

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
}: {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
}) {
  const srcs: string[] = useMemo(() => {
    if (currency === CAVAX[ChainId.AVALANCHE] || currency === CAVAX[ChainId.WAGMI]) return [];
    if (currency instanceof Token || !!(currency as Token).address) {
      return [getTokenLogoURL((currency as Token)?.address)];
    }

    return [];
  }, [currency]);

  if (deepEqual(currency, CAVAX[ChainId.AVALANCHE])) {
    return <AvaxLogo size={size} />;
  }
  else if (deepEqual(currency, CAVAX[ChainId.WAGMI])) {
    return <WgmLogo size={size} />;
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />;
}
