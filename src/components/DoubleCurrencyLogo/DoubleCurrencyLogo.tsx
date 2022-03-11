import { Currency } from '@pangolindex/sdk';
import React from 'react';
import { LogoSize } from 'src/constants';
import { Box } from '../Box';
import { CoveredLogo, HigherLogo, Wrapper } from './styles';

export interface DoubleCurrencyLogoProps {
  margin?: boolean;
  size?: LogoSize;
  currency0?: Currency;
  currency1?: Currency;
}

const DoubleCurrencyLogo = ({ currency0, currency1, size = 24, margin = false }: DoubleCurrencyLogoProps) => {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo currency={currency0} size={size} />}
      {currency1 && (
        <Box ml={'-5px'} display={'flex'}>
          <CoveredLogo currency={currency1} size={size} sizeraw={size} />
        </Box>
      )}
    </Wrapper>
  );
};

export default DoubleCurrencyLogo;
