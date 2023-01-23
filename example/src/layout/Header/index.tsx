import React, { useState } from 'react';
import { HeaderFrame, MenuLink, Menuwrapper } from './styled';
import { useWeb3React } from '@web3-react/core';
import { Button, WalletModal, Box, shortenAddress, NetworkSelection } from '@components/index';
import { useChainId } from '@components/hooks/index';
import Logo from '../Logo';
import { CHAINS } from '@pangolindex/sdk';

export default function Header() {
  const context = useWeb3React();
  const { account } = context;
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);
  const [openNetworkSelection, setOpenNetworkSelection] = useState<boolean>(false);

  const chain = CHAINS[chainId];

  function closeNetworkSelection() {
    setOpenNetworkSelection(true);
  }

  function closeWalletModal() {
    setOpen(true);
  }

  return (
    <HeaderFrame>
      <Logo />
      <Box display="flex">
        <Menuwrapper>
          <MenuLink id="swap" to="/swap">
            Swap
          </MenuLink>
          <MenuLink id="pool" to="/pool">
            Pool
          </MenuLink>
          <MenuLink id="bridge" to="/bridge">
            Bridge
          </MenuLink>
          <MenuLink id="bridge" to="/sar">
            Single Stake
          </MenuLink>
        </Menuwrapper>
        <Box display="grid" style={{ gap: '10px', gridAutoFlow: 'column' }}>
          <Button variant="primary" onClick={closeNetworkSelection} padding="10px">
            {chain.name}
          </Button>
          <Button variant="primary" onClick={closeWalletModal} width="200px">
            {account ? `Connected ${shortenAddress(account, chainId)}` : 'Connect Wallet'}
          </Button>
        </Box>
      </Box>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
      />
      <NetworkSelection
        open={openNetworkSelection}
        closeModal={() => {
          setOpenNetworkSelection(false);
        }}
      />
    </HeaderFrame>
  );
}
