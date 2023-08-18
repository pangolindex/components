import { Box, Button } from '@pangolindex/core';
import { CHAINS, Chain } from '@pangolindex/sdk';
import { shortenAddressMapping, useActiveWeb3React, useChainId } from '@pangolindex/shared';
import {
  ApplicationModal,
  useApplicationState,
  useModalOpen,
  useWalletModalToggle,
  useWalletModalToggleWithChainId,
} from '@pangolindex/state-hooks';
import { NetworkSelection, WalletModal } from '@pangolindex/walletmodal';
import React, { useCallback, useState } from 'react';
import { supportedWallets } from '../../constants';
import Logo from '../Logo';
import { HeaderFrame, MenuLink, Menuwrapper } from './styled';

export default function Header() {
  const context = useActiveWeb3React();
  const { account } = context;
  const chainId = useChainId();

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET);
  const onToogleWalletModal = useWalletModalToggleWithChainId();
  const onOpenWalletModal = useWalletModalToggle();
  const { walletModalChainId } = useApplicationState();

  const [openNetworkSelection, setOpenNetworkSelection] = useState<boolean>(false);

  const shortenAddress = shortenAddressMapping[chainId];
  const chain = CHAINS[chainId];

  function closeNetworkSelection() {
    setOpenNetworkSelection(true);
  }

  const handleSelectChain = useCallback(
    (chain: Chain) => {
      setOpenNetworkSelection(false);
      onToogleWalletModal(chain.chain_id);
    },
    [setOpenNetworkSelection, onToogleWalletModal],
  );

  const closeWalletModal = useCallback(() => {
    onToogleWalletModal(undefined);
  }, [onToogleWalletModal]);

  return (
    <HeaderFrame>
      <Logo />
      <Box display="flex" flex={1}>
        <Menuwrapper>
          <MenuLink id="swap" to="/swap">
            Swap
          </MenuLink>
          <MenuLink id="pool" to="/pool">
            Pool
          </MenuLink>
          <MenuLink id="elixir" to="/elixir">
            Elixir
          </MenuLink>
          <MenuLink id="bridge" to="/bridge">
            Bridge
          </MenuLink>
          <MenuLink id="bridge" to="/sar">
            Stake v2
          </MenuLink>

          <MenuLink id="vote" to="/vote">
            Governance
          </MenuLink>
          <MenuLink id="airdrop" to="/airdrop">
            Airdrop
          </MenuLink>
        </Menuwrapper>
        <Box display="grid" style={{ gap: '10px', gridAutoFlow: 'column' }}>
          <Button variant="primary" onClick={closeNetworkSelection} padding="10px" height="40px">
            {chain.name}
          </Button>
          <Button variant="primary" onClick={onOpenWalletModal} width="200px" height="40px">
            {account ? `Connected ${shortenAddress(account, chainId)}` : 'Connect Wallet'}
          </Button>
        </Box>
      </Box>
      <WalletModal
        open={walletModalOpen}
        closeModal={closeWalletModal}
        onWalletConnect={closeWalletModal}
        initialChainId={walletModalChainId}
        supportedWallets={supportedWallets}
      />
      <NetworkSelection
        open={openNetworkSelection}
        closeModal={() => {
          setOpenNetworkSelection(false);
        }}
        onToogleWalletModal={handleSelectChain}
      />
    </HeaderFrame>
  );
}
