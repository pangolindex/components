import { AVALANCHE_MAINNET } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { Box, Button, Text } from 'src/components';
import { network } from 'src/connectors';
import { useActiveWeb3React } from 'src/hooks/useConnector';
import { useApplicationState } from 'src/state/papplication/atom';
import { changeNetwork } from 'src/utils/wallet';
import Title from '../Title';
import { TextBottomWrapper, Wrapper } from '../styleds';

interface Props {
  subtitle?: string;
  logo: string;
}

export default function AlreadyClaimed({ subtitle, logo }: Props) {
  const { connector } = useActiveWeb3React();
  const { activate, deactivate } = useWeb3React();
  const { wallets } = useApplicationState();

  return (
    <Wrapper>
      <Title title="You Already Claimed" subtitle={subtitle} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="150px">
        <Text fontSize={16} fontWeight={500} color="text1">
          If you think there is a problem contact us via discord.
        </Text>
      </Box>
      <Button
        variant="primary"
        color="black"
        height="46px"
        onClick={() =>
          changeNetwork({
            chain: AVALANCHE_MAINNET,
            connector: connector ?? network,
            wallets: Object.values(wallets),
            activate,
            deactivate,
          })
        }
      >
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
