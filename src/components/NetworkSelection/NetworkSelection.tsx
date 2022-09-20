import { ALL_CHAINS, Chain } from '@pangolindex/sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Box, Modal, Text, ToggleButtons } from 'src/components';
import { ButtonFrame, ChainButton, ChainsList, CloseButton, Frame, Logo } from './styled';
import { NetworkProps } from './types';

interface MetamaskError {
  code: number;
  message: string;
}

enum NETWORK_TYPE {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}

const NetworkSelection: React.FC<NetworkProps> = (props) => {
  const { open, closeModal } = props;
  const [mainnet, setMainnet] = useState(true);
  const [chainListHeight, setChainListHeight] = useState(48);
  const { ethereum } = window;

  const chains = ALL_CHAINS.filter((chain) => chain.pangolin_is_live && chain.mainnet === mainnet);

  const provider = useMemo(() => {
    if (window.xfi && window.xfi.ethereum) {
      return window.xfi.ethereum;
    } else if (window.bitkeep && window.isBitKeep) {
      return window.bitkeep.ethereum;
    }
    return window.ethereum;
  }, undefined);

  useEffect(() => {
    if (chains.length / 2 <= 1) setChainListHeight(48);
    else if (chains.length / 2 <= 2) setChainListHeight(116);
    else setChainListHeight(184);
  }, [mainnet]);

  const changeChain = async (chain: Chain) => {
    if (ethereum) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chain?.chain_id?.toString(16)}` }],
        });
        window.location.reload();
        closeModal();
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        const metamask = error as MetamaskError;
        if (metamask.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: chain.name,
                  chainId: `0x${chain?.chain_id?.toString(16)}`,
                  //nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [chain.rpc_uri],
                  blockExplorerUrls: chain.blockExplorerUrls,
                  iconUrls: chain.logo,
                  nativeCurrency: chain.nativeCurrency,
                },
              ],
            });
            closeModal();
          } catch (_error) {
            return;
          }
        }
      }
    }
  };

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
                <ChainButton key={index} onClick={() => changeChain(chain)}>
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
