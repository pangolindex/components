import { Chain } from '@pangolindex/sdk';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import { NetworkConnector } from 'src/connectors/NetworkConnector';
import { usePangolinWeb3 } from 'src/hooks';
import { useActiveWeb3React } from 'src/hooks/useConnector';
import useDebounce from 'src/hooks/useDebounce';
import { useApplicationState } from 'src/state/papplication/atom';
import { changeNetwork } from 'src/utils/wallet';
import { SUPPORTED_CHAINS } from 'src/wallet';
import ChainItem from './ChainItem';
import { ChainsList, Frame, Inputs, Wrapper } from './styled';
import { NETWORK_TYPE, NetworkProps } from './types';

export default function NetworkSelection({ open, closeModal, onToogleWalletModal }: NetworkProps) {
  const { t } = useTranslation();
  const { account } = usePangolinWeb3();
  const { connector, activate, deactivate } = useActiveWeb3React();

  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // get wallet object in app state because if a dev add custom wallet we neet to get this
  const { wallets } = useApplicationState();

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const handleChangeType = useCallback((value) => {
    setMainnet(value === NETWORK_TYPE.MAINNET);
  }, []);

  const theme = useContext(ThemeContext);
  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 250);

  const chains = useMemo(() => {
    const seletectedChainsType = SUPPORTED_CHAINS.filter((chain) => chain.mainnet === mainnet);

    if (debouncedSearchQuery.length === 0) return seletectedChainsType;

    //filter the chain by the name
    return seletectedChainsType.filter((chain) => chain.name.toLowerCase().includes(debouncedSearchQuery));
  }, [mainnet, debouncedSearchQuery]);

  const { height } = useWindowSize();

  function calcHeightMax() {
    if (height > 600) {
      return 500;
    }
    const maxHeight = height - 250;

    return maxHeight <= 0 ? 125 : maxHeight;
  }

  async function onChainClick(chain: Chain) {
    const walletsArray = Object.values(wallets);
    const activeWallet = walletsArray.find((wallet) => wallet.isActive);

    // if there is no wallet active or an account in app state we can change the chain
    // because the connector is NetworkConnector and we can change chain of it
    if ((!activeWallet || !account) && connector instanceof NetworkConnector) {
      await changeNetwork({
        chain,
        connector,
        wallets: walletsArray,
        activate,
        deactivate,
      });
      return;
    }

    // if don't have active wallet or a connector
    // or the active wallet don't support this chain
    // we need to open the wallet modal to select a chain
    if (
      !activeWallet ||
      !connector ||
      !activeWallet.supportedChains.includes(chain.network_type) ||
      (!!activeWallet.supportedChainsId && !activeWallet.supportedChainsId.includes(chain.chain_id ?? 0))
    ) {
      onToogleWalletModal(chain);
      return;
    }

    // if wallet support this chain we can request to wallet and
    // connector to change the chain
    await changeNetwork({
      chain,
      connector,
      wallets: walletsArray,
      activate,
      deactivate,
    });
  }

  return (
    <Modal isOpen={open} onDismiss={closeModal}>
      <Frame>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text color="text1" fontSize="24px">
            {t('bridge.selectChain')}
          </Text>
          <CloseButton onClick={closeModal} size={24} />
        </Box>
        <Inputs>
          <TextInput
            addonAfter={<Search color={theme.text1} size={28} />}
            onChange={handleSearch}
            value={searchQuery}
          />
          <ToggleButtons
            options={[NETWORK_TYPE.MAINNET, NETWORK_TYPE.TESTNET]}
            value={mainnet === true ? NETWORK_TYPE.MAINNET : NETWORK_TYPE.TESTNET}
            onChange={handleChangeType}
          />
        </Inputs>
        <Wrapper>
          <Scrollbars autoHeight autoHeightMin={125} autoHeightMax={calcHeightMax()}>
            <ChainsList>
              {chains.map((chain) => {
                return <ChainItem key={chain.chain_id ?? 43114} chain={chain} onClick={() => onChainClick(chain)} />;
              })}
            </ChainsList>
          </Scrollbars>
        </Wrapper>
      </Frame>
    </Modal>
  );
}
