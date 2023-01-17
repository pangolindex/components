import { CHAINS } from '@pangolindex/sdk';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { Box, CloseButton, Modal, Text, TextInput, ToggleButtons } from 'src/components';
import useDebounce from 'src/hooks/useDebounce';
import { changeNetwork } from 'src/utils';
import ChainItem from './ChainItem';
import { ChainsList, Frame, Inputs, Wrapper } from './styled';
import { NETWORK_TYPE, NetworkProps } from './types';

export default function NetworkSelection({ open, closeModal }: NetworkProps) {
  const [mainnet, setMainnet] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const handleChangeType = useCallback((value) => {
    setMainnet(value === NETWORK_TYPE.MAINNET);
  }, []);

  const theme = useContext(ThemeContext);
  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 250);

  const chains = useMemo(() => {
    const seletectedChainsType = Object.values(CHAINS).filter((chain) => chain.mainnet === mainnet);

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

  return (
    <Modal isOpen={open} onDismiss={closeModal}>
      <Frame>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text color="text1" fontSize="24px">
            Select Chain
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
                return (
                  <ChainItem
                    key={chain.chain_id ?? 43114}
                    chain={chain}
                    onClick={() => changeNetwork(chain, closeModal)}
                  />
                );
              })}
            </ChainsList>
          </Scrollbars>
        </Wrapper>
      </Frame>
    </Modal>
  );
}
