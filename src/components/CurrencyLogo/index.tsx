import { Currency, Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
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
    if (currency instanceof Token || !!(currency as Token).address) {
      return [getTokenLogoURL((currency as Token)?.address)];
    }

    return [];
  }, [currency]);

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />;
}
