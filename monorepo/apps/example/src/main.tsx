import { HoneycombProvider } from '@honeycomb/honeycomb-provider';
import { NetworkContextName, useActiveWeb3React } from '@honeycomb/shared';
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import getLibrary from './utils/getLibrary';
import { theme } from './utils/theme';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const AppProvider = () => {
  const { library, account, chainId } = useActiveWeb3React();
  return (
    <HoneycombProvider library={library} chainId={chainId} account={account ?? undefined} theme={theme as any}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HoneycombProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <AppProvider />
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
