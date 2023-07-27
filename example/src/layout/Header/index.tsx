import React, { useState, useCallback } from 'react';
import { HeaderFrame, MenuLink, Menuwrapper } from './styled';
import {
  Button,
  WalletModal,
  Box,
  NetworkSelection,
  TokenInfoModal,
  Tokens,
  shortenAddressMapping,
  useActiveWeb3React,
  useApplicationState,
  useWalletModalToggleWithChainId,
  ApplicationModal,
  useModalOpen,
  useWalletModalToggle,
} from '@components/index';
import { useChainId } from '@components/hooks/index';
import Logo from '../Logo';
import { CHAINS, TokenAmount, Chain } from '@pangolindex/sdk';
import { supportedWallets } from '../../constants';

export default function Header() {
  const context = useActiveWeb3React();
  const { account } = context;
  const chainId = useChainId();

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET);
  const onToogleWalletModal = useWalletModalToggleWithChainId();
  const onOpenWalletModal = useWalletModalToggle();
  const { walletModalChainId } = useApplicationState();

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
          <Button variant="primary" onClick={toggleTokenInfoModal} padding="10px" height="40px">
            {chain.png_symbol}
          </Button>
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
