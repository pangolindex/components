import { useWeb3React } from '@web3-react/core';
import React, { useContext } from 'react';
import { AlertCircle, ArrowLeft, Download, LogOut } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Button, Text } from 'src/components';
import { Wallet } from 'src/wallet/classes/wallet';
import { BackButton, ErrorButton, Frame, Link, Loader, StyledLogo, Wrapper } from './styles';

export default function WalletView({
  wallet,
  error,
  onBack,
  onConnect,
}: {
  wallet: Wallet;
  error: boolean;
  onBack: () => void;
  onConnect: (wallet: Wallet) => Promise<void>;
}) {
  const { deactivate } = useWeb3React();
  const theme = useContext(ThemeContext);

  function onDisconnect() {
    wallet.disconnect(deactivate);
    onBack();
  }

  function getContent() {
    if (!wallet.installed()) {
      return (
        <Link href={wallet.href ?? undefined} target="_blank">
          <Download color={theme.primary} />
          <Text color="text1" marginLeft="5px">
            Please Install
          </Text>
        </Link>
      );
    }

    if (error) {
      return (
        <ErrorButton variant="outline" onClick={() => onConnect(wallet)}>
          <AlertCircle color={theme.red1} />
          <Text color="red1" marginLeft="5px">
            Error Try Again
          </Text>
        </ErrorButton>
      );
    }

    if (wallet.isActive) {
      return (
        <Button variant="primary" onClick={onDisconnect} width="max-content" padding="10px">
          <LogOut />
          <Text marginLeft="5px">Disconnect</Text>
        </Button>
      );
    }

    return (
      <Box display="flex" marginTop="20px" alignItems="center">
        <Loader size="24px" />
        <Text color="text1">Initializing...</Text>
      </Box>
    );
  }

  return (
    <Wrapper>
      <BackButton variant="plain" onClick={onBack}>
        <ArrowLeft color={theme.primary} size="16px" />
      </BackButton>
      <Frame>
        <StyledLogo srcs={[wallet.icon]} alt={`${wallet.name} Logo`} />
        <Text color="text1" textAlign="center">
          {wallet.name}
        </Text>
        <Text color="text1" textAlign="center">
          {wallet.description}
        </Text>
        {getContent()}
      </Frame>
    </Wrapper>
  );
}
