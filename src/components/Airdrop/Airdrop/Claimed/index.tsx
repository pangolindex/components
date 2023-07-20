import { AVALANCHE_MAINNET, ChainId } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { Box, Button, Text } from 'src/components';
import { network } from 'src/connectors';
import { usePangolinWeb3 } from 'src/hooks';
import { useActiveWeb3React } from 'src/hooks/useConnector';
import { useApplicationState } from 'src/state/papplication/atom';
import { useWalletModalToggleWithChainId } from 'src/state/papplication/hooks';
import { onChangeNetwork } from 'src/utils/wallet';
import Title from '../../Title';
import { TextBottomWrapper, Wrapper } from '../../styleds';

interface Props {
  subtitle?: string;
  logo: string;
}

export default function AlreadyClaimed({ subtitle, logo }: Props) {
  const { connector, activate, deactivate } = useActiveWeb3React();
  const { account } = usePangolinWeb3();
  const { wallets } = useApplicationState();
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
