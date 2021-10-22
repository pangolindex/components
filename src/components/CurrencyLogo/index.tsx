import { CAVAX, Currency, Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { getTokenLogoURL } from 'src/utils/getTokenLogoURL';
import { StyledLogo } from './styles';
// import AvaxLogo from '../../assets/images/avalanche_token_round.png';

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

    if (currency instanceof Token) {
      return [getTokenLogoURL(currency.address)];
    }

    return [];
  }, [currency]);

  // if (currency === CAVAX) {
  //   return <StyledAvaxLogo src={AvaxLogo} size={size} style={style} />;
  // }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />;
}
