import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useContext, useState } from 'react';
import { AlertCircle, ArrowLeft, Download, LogIn, LogOut } from 'react-feather';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const isInstalled = wallet.installed();

  function onDisconnect() {
    wallet.disconnect();
    deactivate();
    onBack();
  }

  async function onWalletConnect() {
    setIsLoading(true);
    await onConnect(wallet);
    setIsLoading(false);
  }

  const getContent = useCallback(() => {
    if (!isInstalled) {
      return (
        <Link href={wallet.href ?? undefined} target="_blank">
          <Download color={theme.primary} />
          <Text color="text1" marginLeft="5px">
            {t('walletModal.pleaseInstall')}
          </Text>
        </Link>
      );
    }

    if (error) {
      return (
        <ErrorButton variant="outline" onClick={onWalletConnect}>
          <AlertCircle color={theme.red1} />
          <Text color="red1" marginLeft="5px">
            {t('walletModal.errorConnecting')}
          </Text>
        </ErrorButton>
      );
    }

    if (wallet.isActive) {
      return (
        <Button variant="primary" onClick={onDisconnect} width="max-content" padding="10px">
          <LogOut />
          <Text marginLeft="5px">{t('walletModal.disconnect')}</Text>
        </Button>
      );
    }

    if (isLoading) {
      return (
        <Box display="flex" marginTop="20px" alignItems="center">
          <Loader size="24px" />
          <Text color="text1">{t('walletModal.initializing')}</Text>
        </Box>
      );
    }

    return (
      <Button variant="primary" onClick={onWalletConnect} width="max-content" padding="10px">
        <LogIn />
        <Text marginLeft="5px">{t('walletModal.connectWallet')}</Text>
      </Button>
    );
  }, [isInstalled, error, wallet.isActive, isLoading]);

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
