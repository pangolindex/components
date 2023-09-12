import { Box, Text } from '@honeycomb/core';
import { Token } from '@pangolindex/sdk';
import React from 'react';
import Title from '../../Title';
import { TextBottomWrapper, Wrapper } from '../../Title/styleds';

interface Props {
  subtitle?: string;
  token: Token;
  logo: string;
}

export default function NotEligible({ subtitle, token, logo }: Props) {
  return (
    <Wrapper>
      <Title title="Try Next One!" subtitle={subtitle} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="150px">
        <Text fontSize={16} fontWeight={500} color="text1" textAlign="center">
          Sadly you are not eligible for this airdrop.
        </Text>
      </Box>

      <TextBottomWrapper>
        <Text fontSize={14} fontWeight={500} lineHeight="18px" color="text8">
          For {token.symbol} Holder, Staker and Farmers only...
        </Text>
      </TextBottomWrapper>
    </Wrapper>
  );
}
