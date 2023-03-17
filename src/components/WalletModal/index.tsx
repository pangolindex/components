import { CHAINS, ChainId } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useMedia } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ThemeContext } from 'styled-components';
import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import useDebounce from 'src/hooks/useDebounce';
import { MEDIA_WIDTHS } from 'src/theme';
import { SUPPORTED_CHAINS, SUPPORTED_WALLETS } from 'src/wallet';
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

export default function WalletModal({
  open,
  closeModal,
  onWalletConnect,
  supportedWallets,
  supportedChains,
}: WalletModalProps) {
  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChainId, setSelectedChainId] = useState(ChainId.AVALANCHE);
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<boolean>(false);

  const { activate } = useWeb3React();

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const mixpanel = useMixpanel();

  const isMobile = useMedia(`(max-width: ${MEDIA_WIDTHS.upToSmall}px)`);

  function handleSearch(value: any) {
    setSearchQuery(value);
  }

  function handleChainType(value: NETWORK_TYPE) {
    setMainnet(value === NETWORK_TYPE.MAINNET);
  }

  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 250);

  const chains = useMemo(() => {
    const _chains = supportedChains || SUPPORTED_CHAINS;
    return _chains
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
      .filter((chain) => chain.mainnet === mainnet);
  }, [supportedChains, mainnet]);

  const _wallets = supportedWallets || SUPPORTED_WALLETS;

  const wallets = useMemo(() => {
    const selectedChain = CHAINS[selectedChainId];
    // adding additional wallets in wallets mapping
    return Object.values(_wallets)
      .filter((wallet) => {
        const bool = Boolean(
          wallet.supportedChains.includes(selectedChain.network_type) &&
            wallet.name.toLowerCase().includes(debouncedSearchQuery),
        );
        if (!wallet.supportedChainsId) {
          return bool;
        }
        return bool && wallet.supportedChainsId.includes(selectedChain.chain_id ?? NaN);
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  }, [_wallets, selectedChainId, debouncedSearchQuery]);

  function getWalletKey(wallet: Wallet): string | null {
    const result = Object.entries(_wallets).find(
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
      //if wallet is active deactivate it
      wallets.forEach((wallet) => {
        if (wallet.isActive) {
          wallet.isActive = false;
        }
      });
      closeModal();
    }

    if (wallet.installed() && !wallet.isActive) {
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
            placeholder="Try searching for chains"
          />
          <ToggleButtons
            options={[NETWORK_TYPE.MAINNET, NETWORK_TYPE.TESTNET]}
            value={mainnet === true ? NETWORK_TYPE.MAINNET : NETWORK_TYPE.TESTNET}
            onChange={handleChainType}
          />
        </Inputs>
        <Box display="flex" flexGrow={1}>
          <AutoSizer disableWidth style={{ height: 'max-content' }}>
            {({ height }) => (
              <Scrollbars autoHeight autoHeightMin={48} autoHeightMax={isMobile ? height : 358}>
                <ChainFrame>
                  {chains.map((chain, index) => (
                    <ChainButton
                      variant="plain"
                      width="68px"
                      onClick={() => setSelectedChainId(chain.chain_id ?? ChainId.AVALANCHE)}
                      key={index}
                    >
                      {selectedChainId === chain.chain_id ? <Bookmark /> : null}
                      <StyledLogo srcs={[chain.logo ?? '']} alt={`${chain.name} Logo`} />
                    </ChainButton>
                  ))}
                </ChainFrame>
              </Scrollbars>
            )}
          </AutoSizer>
          <Separator />
          <Box flexGrow={1} overflowX="hidden">
            {pendingWallet ? (
              <WalletView wallet={_wallets[pendingWallet]} error={pendingError} onBack={onBack} onConnect={onConnect} />
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
