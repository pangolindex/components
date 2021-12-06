import { CAVAX, Currency, Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
import { AvaxLogo } from '../AvaxLogo';
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
    if (currency === CAVAX) return [];
    if (currency instanceof Token || !!(currency as Token).address) {
      return [getTokenLogoURL((currency as Token)?.address)];
    }

    return [];
  }, [currency]);

  if (currency === CAVAX) {
    return <AvaxLogo size={size} />;
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />;
}
