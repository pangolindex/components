import { Box, Button, Text } from '@pangolindex/core';
import { Token } from '@pangolindex/sdk';
import { useTranslation } from '@pangolindex/shared';
import { useWalletModalToggleWithChainId } from '@pangolindex/state-hooks';
import React from 'react';
import Title from '../../Title';
import { Wrapper } from '../../Title/styleds';

interface Props {
  title?: string;
  token: Token;
  logo: string;
}

export default function NotConnected({ title, token, logo }: Props) {
  const toggleWalletModal = useWalletModalToggleWithChainId();
  const { t } = useTranslation();
  return (
    <Wrapper>
      <Title title={title ?? `Claim ${token.symbol}`} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="150px" flex={1}>
        <Text fontSize={16} fontWeight={500} lineHeight="18px" color="text10">
          Let&apos;s check if you are eligible!
        </Text>
      </Box>
      <Button variant="primary" color="black" height="46px" onClick={() => toggleWalletModal(token.chainId)}>
        {t('swapPage.connectWallet')}
      </Button>
    </Wrapper>
  );
}
