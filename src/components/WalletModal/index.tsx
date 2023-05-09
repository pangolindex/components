import { CHAINS, ChainId, NetworkType } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useMedia } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ThemeContext } from 'styled-components';
import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import useDebounce from 'src/hooks/useDebounce';
import { useApplicationState } from 'src/state/papplication/atom';
import { MEDIA_WIDTHS } from 'src/theme';
import { wait } from 'src/utils/retry';
import { changeNetwork, getWalletKey } from 'src/utils/wallet';
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
  const [selectedChainId, setSelectedChainId] = useState(mainnet ? ChainId.AVALANCHE : ChainId.FUJI);
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<boolean>(false);

  const { activate, deactivate, connector } = useWeb3React();

  const { setWallets } = useApplicationState();

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const isMobile = useMedia(`(max-width: ${MEDIA_WIDTHS.upToSmall}px)`);

  function handleSearch(value: any) {
    setSearchQuery(value);
  }

  function handleChainType(value: NETWORK_TYPE) {
    setMainnet(value === NETWORK_TYPE.MAINNET);
    setSelectedChainId(value === NETWORK_TYPE.MAINNET ? ChainId.AVALANCHE : ChainId.FUJI);
  }

  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 250);

  const chains = useMemo(() => {
    const _chains = supportedChains || SUPPORTED_CHAINS;
    return _chains
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
      .filter((chain) => chain.mainnet === mainnet);
  }, [supportedChains, mainnet]);

  const wallets = useMemo(() => {
    const memoWallets = supportedWallets || SUPPORTED_WALLETS;
    // if you use custom wallets we need to populate the state with these
    // wallets so we can deactivate it in the network selection component
    setWallets(memoWallets);
    return memoWallets;
  }, [supportedWallets]);

  const filteredWallets = useMemo(() => {
    const selectedChain = CHAINS[selectedChainId];
    // adding additional wallets in wallets mapping
    return Object.values(wallets)
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
  }, [wallets, selectedChainId, debouncedSearchQuery]);

  function onBack() {
    setPendingWallet(null);
  }

  async function onConnect(wallet: Wallet) {
    const walletKey = getWalletKey(wallet, wallets);
    setPendingError(false);
    setPendingWallet(walletKey); // set for wallet view

    async function onError(error: unknown) {
      setPendingError(true);
      console.error(error);
    }

    function onSuccess() {
      localStorage.setItem('lastConnectedChainId', selectedChainId.toString());

      setPendingError(false);
      setPendingWallet(null);

      onWalletConnect(walletKey);
      closeModal();
    }

    if (wallet.installed() && !wallet.isActive) {
      //if wallet is active deactivate it
      if (connector) {
        deactivate();
        await wait(500);
      }

      await wallet.tryActivation(activate, onSuccess, onError);

      const chain = CHAINS[selectedChainId];
      if (wallet.isActive && chain.network_type === NetworkType.EVM) {
        await changeNetwork({
          chainId: selectedChainId,
          connector: wallet.connector,
          wallets: Object.values(wallets),
          chain,
          activate,
          deactivate,
        });
      }
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
              <WalletView wallet={wallets[pendingWallet]} error={pendingError} onBack={onBack} onConnect={onConnect} />
            ) : (
              <Scrollbars
                height="100%"
                renderView={(props) => <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />}
              >
                <WalletFrame>
                  {filteredWallets.map((wallet, index) => {
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
