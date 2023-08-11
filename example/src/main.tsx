import React from 'react';
import ReactDOM from 'react-dom';
import './normalize.css';
import App from './App';
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core';
import { NetworkContextName, PangolinProvider, useActiveWeb3React } from '@components/index';
import getLibrary from './utils/getLibrary';
import { theme } from './utils/theme';
import { BrowserRouter } from 'react-router-dom';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const AppProvider = () => {
  const { library, account, chainId } = useActiveWeb3React();
  return (
    <PangolinProvider library={library} chainId={chainId} account={account ?? undefined} theme={theme as any}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PangolinProvider>
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
