import { ALL_CHAINS } from '@pangolindex/sdk';
import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Box, Modal, Text, ToggleButtons } from 'src/components';
import { changeNetwork } from 'src/utils';
import { ButtonFrame, ChainButton, ChainsList, CloseButton, Frame, Logo } from './styled';
import { NetworkProps } from './types';

enum NETWORK_TYPE {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}

const NetworkSelection: React.FC<NetworkProps> = (props) => {
  const { open, closeModal } = props;
  const [mainnet, setMainnet] = useState(true);
  const [chainListHeight, setChainListHeight] = useState(48);

  const chains = ALL_CHAINS.filter((chain) => chain.pangolin_is_live && chain.mainnet === mainnet);

  useEffect(() => {
    if (chains.length / 2 <= 1) setChainListHeight(48);
    else if (chains.length / 2 <= 2) setChainListHeight(116);
    else setChainListHeight(184);
  }, [mainnet]);

  return (
    <Modal isOpen={open} onDismiss={closeModal}>
      <Frame>
        <CloseButton onClick={closeModal} />
        <Text color="text1" fontSize="24px" marginBottom={20} style={{ gridArea: 'text' }}>
          Select Chain
        </Text>
        <ButtonFrame>
          <ToggleButtons
            options={[NETWORK_TYPE.MAINNET, NETWORK_TYPE.TESTNET]}
            value={mainnet === true ? NETWORK_TYPE.MAINNET : NETWORK_TYPE.TESTNET}
            onChange={(value) => {
              setMainnet(value === NETWORK_TYPE.MAINNET);
            }}
          />
        </ButtonFrame>
        <Box height={chainListHeight} style={{ gridArea: 'chains' }}>
          <Scrollbars>
            <ChainsList>
              {chains.map((chain, index) => (
                <ChainButton key={index} onClick={() => changeNetwork(chain, closeModal)}>
                  <Logo src={chain.logo} />
                  <Text color="text1">{chain.name}</Text>
                </ChainButton>
              ))}
            </ChainsList>
          </Scrollbars>
        </Box>
      </Frame>
    </Modal>
  );
};

export default NetworkSelection;
