import { Box, Button, Text } from '@pangolindex/core';
import { AVALANCHE_MAINNET, ChainId } from '@pangolindex/sdk';
import { useActiveWeb3React, usePangolinWeb3 } from '@pangolindex/shared';
import { useWalletModalToggleWithChainId } from '@pangolindex/state-hooks';
import { network } from '@pangolindex/wallet-connectors';
import { onChangeNetwork, useWalletState } from '@pangolindex/walletmodal';
import React, { useCallback } from 'react';
import Title from '../../Title';
import { TextBottomWrapper, Wrapper } from '../../Title/styleds';

interface Props {
  subtitle?: string;
  logo: string;
}

export default function AlreadyClaimed({ subtitle, logo }: Props) {
  const { connector, activate, deactivate } = useActiveWeb3React();
  const { account } = usePangolinWeb3();
  const { wallets } = useWalletState();
  const onToogleWalletModalWithId = useWalletModalToggleWithChainId();

  const onChainClick = useCallback(async () => {
    const onToogleWalletModal = () => {
      onToogleWalletModalWithId(ChainId.AVALANCHE);
    };

    await onChangeNetwork({
      account,
      activate,
      deactivate,
      onToogleWalletModal,
      chain: AVALANCHE_MAINNET,
      connector: connector ?? network,
      wallets: Object.values(wallets),
    });
  }, [account, connector, wallets, activate, deactivate, onToogleWalletModalWithId]);

  return (
    <Wrapper>
      <Title title="You Already Claimed" subtitle={subtitle} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="150px">
        <Text fontSize={16} fontWeight={500} color="text1">
          If you think there is a problem contact us via discord.
        </Text>
      </Box>
      <Button variant="primary" color="black" height="46px" onClick={onChainClick}>
        GO BACK TO AVALANCHE
      </Button>
      <TextBottomWrapper>
        <Text fontSize={14} fontWeight={500} color="text8">
          Haven’t I seen you before?
        </Text>
      </TextBottomWrapper>
    </Wrapper>
  );
}
