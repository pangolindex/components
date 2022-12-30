import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Button, PoolsUI, PoolType, usePangoChefInfosHook, WalletModal } from '@components/index';
import { useChainId } from '@components/hooks';

function App() {
  const context = useWeb3React();
  const { account } = context;
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);

  const info = usePangoChefInfosHook[chainId]();

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {account ? `Wallet connected: ${account}` : 'Connect Wallet'}
      </Button>
      <WalletModal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
        onWalletConnect={() => {
          setOpen(false);
        }}
      />
      <PoolsUI />
    </div>
  );
}

export default App;
