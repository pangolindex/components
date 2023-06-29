import { Token } from '@pangolindex/sdk';
import React from 'react';
import { Box, Text } from 'src/components';
import Title from '../../Title';
import { Wrapper } from '../../styleds';

interface Props {
  token: Token;
  logo: string;
}

export default function ClosedRegistration({ token, logo }: Props) {
  return (
    <Wrapper>
      <Title title={`${token?.symbol} Airdrop`} logo={logo} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
        minWidth="150px"
        style={{ gap: '5px' }}
      >
        <Text fontSize={16} fontWeight={500} color="text10">
          Registraton window has been closed.
        </Text>
        <Text fontSize={16} fontWeight={500} color="text10">
          Claim widget will be live in few hours.
        </Text>
      </Box>
    </Wrapper>
  );
}
