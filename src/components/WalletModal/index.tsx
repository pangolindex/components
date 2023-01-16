import { ChainId, CHAINS } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Box, Button, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import { useMixpanel } from 'src/hooks/mixpanel';
import useDebounce from 'src/hooks/useDebounce';
import { ThemeContext } from 'styled-components';
import { CloseButton } from '../NetworkSelection/styled';
import { NETWORK_TYPE } from '../NetworkSelection/types';
import { ChainFrame, Header, Inputs, Separator, StyledLogo, WalletFrame, Wrapper } from './styleds';
import { SUPPORTED_WALLETS, WalletInfo } from 'src/constants';
import { WalletModalProps } from './types';
import { MixPanelEvents } from 'src/hooks/mixpanel';


const getConnectorKey = (connector: AbstractConnector) =>
  Object.keys(SUPPORTED_WALLETS).find((key) => SUPPORTED_WALLETS[key].connector === connector) ?? null;

export default function WalletModal({
  open,
  closeModal,
  onWalletConnect,
  background,
  onClickBack,
  shouldShowBackButton,
}: WalletModalProps) {
  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState(ChainId.AVALANCHE);
  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();
  const [selectedOption, setSelectedOption] = useState<WalletInfo | undefined>();
  const [pendingError, setPendingError] = useState<boolean>();

  const {activate} = useWeb3React();

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

  const chains = useMemo(() => Object.values(CHAINS).filter((chain) => chain.mainnet === mainnet), [mainnet]);

  const wallets = useMemo(
    () => Object.values(SUPPORTED_WALLETS).filter((wallet) => wallet.name.includes(debouncedSearchQuery)),
    [SUPPORTED_WALLETS, debouncedSearchQuery],
  );

  async function onConnect(wallet: WalletInfo) {
    setPendingWallet(wallet.connector); // set wallet for pending view
    setSelectedOption(wallet);

    function onError() {
      alert('error');
    }

    function onSuccess() {
      onWalletConnect(getConnectorKey(wallet.connector));
      mixpanel.track(MixPanelEvents.WALLET_CONNECT, {
        wallet_name: wallet?.name?.toLowerCase(),
        source: 'pangolin-components',
      });
    }

    await wallet.tryActivation?.(activate, wallet.connector, onSuccess, onError);
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
                {chains.map((chain) => (
                  <Button variant="plain" width="68px">
                    <StyledLogo srcs={[chain.logo ?? '']} alt={`${chain.name} Logo`} />
                  </Button>
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
                {wallets.map((wallet) => {
                  if (!wallet.isShowing) return null;
                  return (
                    <Button variant="plain" onClick={() => onConnect(wallet)}>
                      <StyledLogo srcs={[wallet.iconName]} alt={`${wallet.name} Logo`} />
                    </Button>
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
