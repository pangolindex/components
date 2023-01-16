import React from 'react';
import { LogoSize } from 'src/constants';
import { Box } from '../Box';
import { CoveredLogo, HigherLogo, Wrapper } from './styles';

export interface DoubleLogoProps {
  margin?: boolean;
  size?: LogoSize;
  logo0?: string;
  logo1?: string;
}

const DoubleLogo = ({ logo0, logo1, size = 24, margin = false }: DoubleLogoProps) => {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {logo0 && <HigherLogo srcs={[logo0]} size={size} />}
      {logo1 && (
        <Box ml={'-5px'} display={'flex'}>
          <CoveredLogo srcs={[logo1]} size={size} sizeraw={size} />
        </Box>
      )}
    </Wrapper>
  );
};

export default DoubleLogo;
