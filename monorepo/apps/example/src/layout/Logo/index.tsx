import { Box } from '@honeycomb/core';
import React from 'react';
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
