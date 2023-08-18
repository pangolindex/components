import { Chain } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useCallback } from 'react';
import { Box, Button, Text } from 'src/components';
import { network } from 'src/connectors';
import { usePangolinWeb3 } from 'src/hooks';
import { useActiveWeb3React } from 'src/hooks/useConnector';
import { useApplicationState } from 'src/state/papplication/atom';
import { useWalletModalToggleWithChainId } from 'src/state/papplication/hooks';
import { onChangeNetwork } from 'src/utils/wallet';
import Title from '../../Title';
import { Wrapper } from '../../styleds';

interface Props {
  chain: Chain;
  logo: string;
}

export default function ChangeChain({ chain, logo }: Props) {
  const { connector, activate, deactivate } = useActiveWeb3React();
  const { account } = usePangolinWeb3();
  const { wallets } = useApplicationState();
  const toggleWalletModalId = useWalletModalToggleWithChainId();

  const onChainClick = useCallback(async () => {
    const onToogleWalletModal = () => {
      toggleWalletModalId(chain.chain_id);
    };

    await onChangeNetwork({
      chain,
      account,
      activate,
      deactivate,
      onToogleWalletModal,
      connector: connector ?? network,
      wallets: Object.values(wallets),
    });
  }, [account, connector, wallets, activate, deactivate, toggleWalletModalId]);

  return (
    <Wrapper>
      <Title title={`Change to ${chain?.name}`} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="120px" flex={1}>
        <Text fontSize={16} fontWeight={500} color="text1">
          Go to {chain.name} to see if you are eligible!
        </Text>
      </Box>
      <Button height="46px" color="black" variant="primary" onClick={onChainClick}>
        GO TO {chain.name.toUpperCase()}
      </Button>
    </Wrapper>
  );
}
