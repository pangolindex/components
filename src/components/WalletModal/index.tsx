import { CHAINS, ChainId } from '@pangolindex/sdk';
import { UserRejectedRequestError } from '@pangolindex/web3-react-injected-connector';
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useMedia } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ThemeContext } from 'styled-components';
import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import useDebounce from 'src/hooks/useDebounce';
import { useApplicationState } from 'src/state/papplication/atom';
import { useUserAtom } from 'src/state/puser/atom';
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
  initialChainId,
}: WalletModalProps) {
  const { chainId } = usePangolinWeb3();

  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedChainId, setSelectedChainId] = useState(
    chainId ? chainId : mainnet ? ChainId.AVALANCHE : ChainId.FUJI,
  );
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<boolean>(false);

  const { activate, deactivate, connector } = useWeb3React();

  // this useEffect only run when we set initialChainId
  // as of now initialChainId will be set when user comes from NetworkSelection modal to WalletModal
  useEffect(() => {
    if (initialChainId) {
      // if network selection change chain it will update selectedChain
      setSelectedChainId(initialChainId);

      // here we can select networktype based on chain selected from Networkselection
      setMainnet(CHAINS[initialChainId]?.mainnet);

      setPendingWallet(null);
    }
  }, [initialChainId]);

  const { setWallets } = useApplicationState();
  const { userState } = useUserAtom();

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const isMobile = useMedia(`(max-width: ${MEDIA_WIDTHS.upToSmall}px)`);

  function handleSearch(value: any) {
    setSearchQuery(value);
  }

  function handleChainType(value: NETWORK_TYPE) {
    setMainnet(value === NETWORK_TYPE.MAINNET);
    // when we switch the network type if already chainId selected it will be same
    const finalChainId = initialChainId ?? chainId;
    if (
      finalChainId &&
      ((value === NETWORK_TYPE.MAINNET && CHAINS[finalChainId]?.mainnet) ||
        (value === NETWORK_TYPE.TESTNET && !CHAINS[finalChainId]?.mainnet))
    ) {
      setSelectedChainId(finalChainId);
    } else {
      setSelectedChainId(value === NETWORK_TYPE.MAINNET ? ChainId.AVALANCHE : ChainId.FUJI);
    }
  }

  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 250);

  const chains = useMemo(() => {
    const _chains = supportedChains ?? SUPPORTED_CHAINS;
    return _chains
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
      .filter(
        (chain) =>
          chain.mainnet === mainnet &&
          (chain.name.toLowerCase().includes(debouncedSearchQuery) ||
            chain.symbol.toLowerCase().includes(debouncedSearchQuery)),
      );
  }, [supportedChains, mainnet, debouncedSearchQuery]);

  const wallets = useMemo(() => {
    const memoWallets = supportedWallets ?? SUPPORTED_WALLETS;
    // if you use custom wallets we need to populate the app state with these
    // wallets so we can access it in another part of the app
    setWallets(memoWallets);
    return memoWallets;
  }, [supportedWallets]);

  const filteredWallets = useMemo(() => {
    const selectedChain = CHAINS[selectedChainId];
    // return  an array with filtered wallets
    // if selected chain by user supports this wallet (have same network type)
    // and name of wallet includes the search name
    // and should show the wallet
    // case exist array of supported chain id in wallet  check this too
    return Object.values(wallets)
      .filter((wallet) => {
        // if selected chain by user supports this wallet and
        const bool = Boolean(wallet.supportedChains.includes(selectedChain.network_type) && wallet.showWallet());

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

  function onWalletClick(wallet: Wallet) {
    const walletKey = getWalletKey(wallet, wallets);
    setPendingError(false);
    setPendingWallet(walletKey); // set for wallet view
  }

  async function onConnect(wallet: Wallet) {
    setPendingError(false);

    async function onError(error: any) {
      setPendingError(true);
      console.error(error);
      if (error instanceof UserRejectedRequestError || error?.code === 4001) {
        const previousWallet = userState.wallet ? wallets[userState.wallet] : undefined;
        if (previousWallet && previousWallet !== wallet) {
          // this is just a fallback when user rejects the request
          // because the @web3-react remove the chainid account and libarary from state
          // and this just to reconnect the previus wallet again
          previousWallet?.tryActivation({ activate });
        }
      }
    }

    function onSuccess() {
      const walletKey = getWalletKey(wallet, wallets);
      localStorage.setItem('lastConnectedChainId', selectedChainId.toString());

      setPendingError(false);
      setPendingWallet(null);

      onWalletConnect(walletKey);
      closeModal();
    }

    if (wallet.installed()) {
      //if wallet is active deactivate it
      if (connector) {
        deactivate();
        await wait(500);
      }

      await wallet.tryActivation({ activate, onSuccess, onError, chainId: selectedChainId });

      const chain = CHAINS[selectedChainId];
      if (wallet.isActive) {
        await changeNetwork({
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
    <Modal isOpen={open} onDismiss={closeModal} closeOnClickOutside={false}>
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
            placeholder={t('walletModal.trySearchChains')}
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
                      onClick={() => {
                        setSelectedChainId(chain.chain_id ?? ChainId.AVALANCHE);
                        setPendingWallet(null);
                      }}
                      key={index}
                      id={`${chain.chain_id}`}
                    >
                      {selectedChainId === chain.chain_id ? <Bookmark /> : null}
                      <StyledLogo title={chain.name} srcs={[chain.logo ?? '']} alt={`${chain.name} Logo`} />
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
                {filteredWallets.length === 0 ? (
                  <Box width="100%">
                    <Text color="text1" textAlign="center">
                      {t('walletModal.notFound')}
                    </Text>
                  </Box>
                ) : (
                  <WalletFrame>
                    {filteredWallets.map((wallet, index) => {
                      return (
                        <WalletButton variant="plain" onClick={() => onWalletClick(wallet)} key={index}>
                          <StyledLogo title={wallet.name} srcs={[wallet.icon]} alt={`${wallet.name} Logo`} />
                          <Text color="text1" fontSize="12px" fontWeight={600}>
                            {wallet.name}
                          </Text>
                          {wallet.isActive ? <GreenCircle /> : null}
                        </WalletButton>
                      );
                    })}
                  </WalletFrame>
                )}
              </Scrollbars>
            )}
          </Box>
        </Box>
      </Wrapper>
    </Modal>
  );
}
