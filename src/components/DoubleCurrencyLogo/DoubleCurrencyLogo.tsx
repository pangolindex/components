import { Currency } from '@pangolindex/sdk';
import React from 'react';
import { CoveredLogo, HigherLogo, Wrapper } from './styles';

export interface DoubleCurrencyLogoProps {
  margin?: boolean;
  size?: number;
  currency0?: Currency;
  currency1?: Currency;
}

const DoubleCurrencyLogo = ({ currency0, currency1, size = 16, margin = false }: DoubleCurrencyLogoProps) => {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo currency={currency0} size={size.toString() + 'px'} />}
      {currency1 && <CoveredLogo currency={currency1} size={size.toString() + 'px'} sizeraw={size} />}
    </Wrapper>
  );
};

export default DoubleCurrencyLogo;
