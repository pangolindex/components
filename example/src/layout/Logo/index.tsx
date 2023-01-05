import React from 'react';
import { Box } from '@components/index';
import LogoDark from '../../assets/svg/logoSloganDark.svg';
import { LogoWrapper } from './styled';

export default function LogoIcon() {
  return (
    <LogoWrapper>
      <Box>
        <img height="28px" src={LogoDark} alt="logo" />
      </Box>
    </LogoWrapper>
  );
}
