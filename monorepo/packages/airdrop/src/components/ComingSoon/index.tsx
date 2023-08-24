import { Box, Text } from '@pangolindex/core';
import { Token } from '@pangolindex/sdk';
import React from 'react';
import Title from '../Title';
import { Wrapper } from '../Title/styleds';

export interface Props {
  token: Token;
  logo: string;
}

export default function CommingSoon({ token, logo }: Props) {
  return (
    <Wrapper>
      <Title title={`Claim ${token?.symbol}`} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1} minWidth="150px">
        <Text fontSize={16} fontWeight={800} lineHeight="18px" color="text10" textAlign="center">
          Coming SOON...
        </Text>
      </Box>
    </Wrapper>
  );
}
