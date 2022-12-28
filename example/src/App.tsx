import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Button, Pools, PoolType, usePangoChefInfosHook, WalletModal } from '@components/index';
import { useChainId } from '@components/hooks';

function App() {
  const context = useWeb3React();
  const { account } = context;
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);

  const info = usePangoChefInfosHook[chainId]();

  return (
    <div className="App">
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
      <Pools
        type={PoolType.all}
        version={3}
        stakingInfoV1={[]}
        miniChefStakingInfo={[]}
        pangoChefStakingInfo={info || []}
        activeMenu={'allFarmV3'}
        setMenu={() => {}}
        menuItems={[{ label: '', value: '' }]}
      />
    </div>
  );
}

export default App;
