import React, { useState } from 'react';
import { HeaderFrame, MenuLink, Menuwrapper } from './styled';
import { useWeb3React } from '@web3-react/core';
import {
  Button,
  WalletModal,
  Box,
  NetworkSelection,
  TokenInfoModal,
  Tokens,
  shortenAddressMapping,
} from '@components/index';
import { useChainId } from '@components/hooks/index';
import Logo from '../Logo';
import { CHAINS, TokenAmount } from '@pangolindex/sdk';

export default function Header() {
  const context = useWeb3React();
  const { account } = context;
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);
  const [openNetworkSelection, setOpenNetworkSelection] = useState<boolean>(false);
  const [showTokenInfoModal, setShowTokenInfoModal] = useState<boolean>(false);
  const shortenAddress = shortenAddressMapping[chainId];
  const chain = CHAINS[chainId];
  const png = Tokens.PNG[chainId];

  function closeNetworkSelection() {
    setOpenNetworkSelection(true);
  }

  const toggleTokenInfoModal = () => {
    setShowTokenInfoModal((prev) => !prev);
  };

  function closeWalletModal() {
    setOpen(true);
  }

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
          <MenuLink id="concliq" to="/concliq">
            ConcLiq
          </MenuLink>
          <MenuLink id="bridge" to="/bridge">
            Bridge
          </MenuLink>
          <MenuLink id="bridge" to="/sar">
            Stake v2
          </MenuLink>
        </Menuwrapper>
        <Box display="grid" style={{ gap: '10px', gridAutoFlow: 'column' }}>
          <Button variant="primary" onClick={toggleTokenInfoModal} padding="10px" height="40px">
            {chain.png_symbol}
          </Button>
          <Button variant="primary" onClick={closeNetworkSelection} padding="10px" height="40px">
            {chain.name}
          </Button>
          <Button variant="primary" onClick={closeWalletModal} width="200px" height="40px">
            {account ? `Connected ${shortenAddress(account)}` : 'Connect Wallet'}
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
      <TokenInfoModal
        open={showTokenInfoModal}
        unclaimedAmount={new TokenAmount(png, '0')}
        circulationSupply={new TokenAmount(png, '0')}
        closeModal={toggleTokenInfoModal}
        token={png}
      />
    </HeaderFrame>
  );
}
