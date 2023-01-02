import React, { useState } from 'react';
import { HeaderFrame, MenuLink, Menuwrapper } from './styled';
import { useWeb3React } from '@web3-react/core';
import { Button, WalletModal, Box, shortenAddress } from '@components/index';
import { useChainId } from '@components/hooks/index';
import Logo from '../Logo';

export default function Header() {
  const context = useWeb3React();
  const { account } = context;
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);

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
        </Menuwrapper>

        <Button variant="primary" onClick={() => setOpen(true)} width="200px">
          {account ? `Connected ${shortenAddress(account, chainId)}` : 'Connect Wallet'}
        </Button>
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
    </HeaderFrame>
  );
}
