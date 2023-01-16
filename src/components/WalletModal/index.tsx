import { ChainId, CHAINS } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Box, Button, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import { useMixpanel } from 'src/hooks/mixpanel';
import useDebounce from 'src/hooks/useDebounce';
import { ThemeContext } from 'styled-components';
import { CloseButton } from '../NetworkSelection/styled';
import { NETWORK_TYPE } from '../NetworkSelection/types';
import {
  ChainFrame,
  GreenCircle,
  Header,
  Inputs,
  Separator,
  WalletButton,
  StyledLogo,
  WalletFrame,
  Wrapper,
  ChainButton,
  Bookmark,
} from './styleds';
import { WalletModalProps } from './types';
import { MixPanelEvents } from 'src/hooks/mixpanel';
import { SUPPORTED_WALLETS } from 'src/wallet';
import { Wallet } from 'src/wallet/classes/wallet';

export default function WalletModal({
  open,
  closeModal,
  onWalletConnect,
  background,
  onClickBack,
  shouldShowBackButton,
  additionalWallets,
}: WalletModalProps) {
  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState(ChainId.AVALANCHE);
  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();
  const [selectedWallet, setSelectedWallet] = useState<string | undefined>();
  const [pendingError, setPendingError] = useState<boolean>();

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

  const wallets = useMemo(() => {
    // adding additional wallets in wallets mapping
    const _wallets = { ...SUPPORTED_WALLETS, ...additionalWallets };
    return Object.values(_wallets).filter((wallet) => wallet.name.includes(debouncedSearchQuery));
  }, [SUPPORTED_WALLETS, additionalWallets, debouncedSearchQuery]);

  function getWalletKey(wallet: Wallet): string | null {
    const result = Object.entries(wallets).find(([_, value]) => value === wallet);

    if (result) {
      return result[0];
    }
    return null;
  }

  async function onConnect(wallet: Wallet) {
    setPendingWallet(wallet.connector); // set wallet for pending view
    //setSelectedOption(wallet);

    function onError(error: unknown) {
      console.error(error);
    }

    function onSuccess() {
      onWalletConnect(getWalletKey(wallet));
      mixpanel.track(MixPanelEvents.WALLET_CONNECT, {
        wallet_name: wallet?.name?.toLowerCase(),
        source: 'pangolin-components',
      });
    }

    await wallet.tryActivation(activate, onSuccess, onError);
  }

  return (
    <Modal isOpen={open} onDismiss={closeModal}>
      <Wrapper>
        <Header>
          <Text color="text1" fontSize="24px" fontWeight={700}>
            {t('walletModal.connectToWallet')}
          </Text>
          <CloseButton onClick={closeModal} />
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
          </Box>
        </Box>
      </Wrapper>
    </Modal>
  );
}
