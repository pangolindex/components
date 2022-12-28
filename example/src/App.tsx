// @ts-ignore
import React from 'react';
import './App.css';
import { useWeb3React } from '@web3-react/core';
import { Button, SwapWidget } from '@components/index';
import { injected, useEagerConnect, useInactiveListener } from './utils/hooks';

function App() {
  const context = useWeb3React();
  const { account } = context;
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager);

  return (
    <div className="App">
      <Button
        variant="primary"
        isDisabled={!!account}
        onClick={() => {
          injected.activate();
        }}
        width="400px"
      >
        {!account ? 'Connect Wallet' : account}
      </Button>
      <div style={{ marginTop: '10px', maxWidth: '400px' }}>
        <SwapWidget />
      </div>
    </div>
  );
}

export default App;
