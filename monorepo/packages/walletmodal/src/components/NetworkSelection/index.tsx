import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from '@honeycomb/core';
import { useActiveWeb3React, useDebounce, usePangolinWeb3, useTranslation } from '@honeycomb/shared';
import { network } from '@honeycomb/wallet-connectors';
import { Chain } from '@pangolindex/sdk';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { useWalletState } from 'src/state/atom';
import { onChangeNetwork } from 'src/utils';
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
  const { wallets } = useWalletState();

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

  const onChainClick = useCallback(
    async (chain: Chain) => {
      await onChangeNetwork({
        chain,
        account,
        activate,
        deactivate,
        onToogleWalletModal,
        connector: connector ?? network,
        wallets: Object.values(wallets),
      });
    },
    [account, connector, wallets, activate, deactivate, onToogleWalletModal],
  );

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
            {chains.length === 0 ? (
              <Text color="text1" textAlign="center">
                {t('walletModal.noChainsFound')}
              </Text>
            ) : (
              <ChainsList>
                {chains.map((chain) => {
                  return <ChainItem key={chain.chain_id ?? 43114} chain={chain} onClick={() => onChainClick(chain)} />;
                })}
              </ChainsList>
            )}
          </Scrollbars>
        </Wrapper>
      </Frame>
    </Modal>
  );
}
