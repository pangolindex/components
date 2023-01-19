import { CHAINS, ChainId } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import useDebounce from 'src/hooks/useDebounce';
import { SUPPORTED_WALLETS } from 'src/wallet';
import { Wallet } from 'src/wallet/classes/wallet';
import { NETWORK_TYPE } from '../NetworkSelection/types';
import WalletView from './WalletView';
import {
  Bookmark,
  ChainButton,
  ChainFrame,
  GreenCircle,
  Header,
  Inputs,
  Separator,
  StyledLogo,
  WalletButton,
  WalletFrame,
  Wrapper,
} from './styleds';
import { WalletModalProps } from './types';

export default function WalletModal({ open, closeModal, onWalletConnect, additionalWallets }: WalletModalProps) {
  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState(ChainId.AVALANCHE);
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<boolean>(false);

  const { activate } = useWeb3React();

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const mixpanel = useMixpanel();

  function handleSearch(value: any) {
    setSearchQuery(value);
  }

  function handleChainType(value: NETWORK_TYPE) {
    setMainnet(value === NETWORK_TYPE.MAINNET);
  }

  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 250);

  const chains = useMemo(
    () =>
      Object.values(CHAINS)
        .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
        .filter((chain) => chain.mainnet === mainnet),
    [mainnet],
  );

  const allWallets = { ...SUPPORTED_WALLETS, ...additionalWallets };

  const wallets = useMemo(() => {
    const _selectedChains = CHAINS[selectedChain];
    // adding additional wallets in wallets mapping
    return Object.values(allWallets).filter(
      (wallet) =>
        wallet.supportedChains.includes(_selectedChains.network_type) &&
        wallet.name.toLowerCase().includes(debouncedSearchQuery),
    );
  }, [allWallets, debouncedSearchQuery]);

  function getWalletKey(wallet: Wallet): string | null {
    const result = Object.entries(allWallets).find(
      ([, value]) => value === wallet && value.name.toLowerCase() === wallet.name.toLowerCase(),
    );

    if (result) {
      return result[0];
    }
    return null;
  }

  function onBack() {
    setPendingWallet(null);
  }

  async function onConnect(wallet: Wallet) {
    const walletKey = getWalletKey(wallet);
    setPendingError(false);
    setPendingWallet(walletKey); // set for wallet view

    function onError(error: unknown) {
      setPendingError(true);
      console.error(error);
    }

    function onSuccess() {
      onWalletConnect(walletKey);
      mixpanel.track(MixPanelEvents.WALLET_CONNECT, {
        wallet_name: wallet?.name?.toLowerCase(),
        source: 'pangolin-components',
      });
      setPendingError(false);
      setPendingWallet(null);
      closeModal();
    }

    if (wallet.installed()) {
      await wallet.tryActivation(activate, onSuccess, onError);
    }
  }

  return (
    <Modal isOpen={open} onDismiss={closeModal}>
      <Wrapper>
        <Header>
          <Text color="text1" fontSize="24px" fontWeight={700}>
            {t('walletModal.connectToWallet')}
          </Text>
          <CloseButton onClick={closeModal} size="24px" />
        </Header>
        <Inputs>
          <TextInput
            addonAfter={<Search color={theme.text1} size={28} />}
            onChange={handleSearch}
            value={searchQuery}
          />
          <ToggleButtons
            options={[NETWORK_TYPE.MAINNET, NETWORK_TYPE.TESTNET]}
            value={mainnet === true ? NETWORK_TYPE.MAINNET : NETWORK_TYPE.TESTNET}
            onChange={handleChainType}
          />
        </Inputs>
        <Box display="flex">
          <Box>
            <Scrollbars autoHeight autoHeightMin={48} autoHeightMax={358}>
              <ChainFrame>
                {chains.map((chain, index) => (
                  <ChainButton
                    variant="plain"
                    width="68px"
                    onClick={() => setSelectedChain(chain.chain_id ?? ChainId.AVALANCHE)}
                    key={index}
                  >
                    {selectedChain === chain.chain_id ? <Bookmark /> : null}
                    <StyledLogo srcs={[chain.logo ?? '']} alt={`${chain.name} Logo`} />
                  </ChainButton>
                ))}
              </ChainFrame>
            </Scrollbars>
          </Box>
          <Separator />
          <Box flexGrow={1} overflowX="hidden">
            {pendingWallet ? (
              <WalletView
                wallet={allWallets[pendingWallet]}
                error={pendingError}
                onBack={onBack}
                onConnect={onConnect}
              />
            ) : (
              <Scrollbars
                height="100%"
                renderView={(props) => <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />}
              >
                <WalletFrame>
                  {wallets.map((wallet, index) => {
                    if (!wallet.showWallet()) return null;
                    return (
                      <WalletButton variant="plain" onClick={() => onConnect(wallet)} key={index}>
                        <StyledLogo srcs={[wallet.icon]} alt={`${wallet.name} Logo`} />
                        <Text color="text1" fontSize="12px" fontWeight={600}>
                          {wallet.name}
                        </Text>
                        {wallet.isActive ? <GreenCircle /> : null}
                      </WalletButton>
                    );
                  })}
                </WalletFrame>
              </Scrollbars>
            )}
          </Box>
        </Box>
      </Wrapper>
    </Modal>
  );
}
