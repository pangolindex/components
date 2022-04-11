import { CAVAX, ChainId, Currency, Token } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import React, { useMemo } from 'react';
import { AvaxLogo, WgmLogo } from 'src/components/Icons';
import { LogoSize } from 'src/constants';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
import { StyledLogo } from './styles';

export default function CurrencyLogo({
  currency,
  size = 24,
  style,
  imageSize = size,
}: {
  currency?: Currency;
  size?: LogoSize;
  style?: React.CSSProperties;
  imageSize?: LogoSize;
}) {
  const srcs: string[] = useMemo(() => {
    if (currency === CAVAX[ChainId.AVALANCHE] || currency === CAVAX[ChainId.WAGMI]) return [];
    if (currency instanceof Token || !!(currency as Token).address) {
      const primarySrc = getTokenLogoURL((currency as Token)?.address, imageSize);

      return [primarySrc];
    }

    return [];
  }, [currency]);

  if (deepEqual(currency, CAVAX[ChainId.AVALANCHE])) {
    return <AvaxLogo size={`${size}px`} />;
  } else if (deepEqual(currency, CAVAX[ChainId.WAGMI])) {
    return <WgmLogo size={`${size}px`} />;
  }

  return <StyledLogo size={`${size}px`} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />;
}
