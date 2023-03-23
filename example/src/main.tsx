import React from 'react';
import ReactDOM from 'react-dom';
import './normalize.css';
import App from './App';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { PangolinProvider } from '@components/index';
import getLibrary from './utils/getLibrary';
import { theme } from './utils/theme';
import { BrowserRouter } from 'react-router-dom';
import { Web3Provider } from '@ethersproject/providers';

const AppProvider = () => {
  const { library, account, chainId } = useWeb3React<Web3Provider>();

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
      <AppProvider />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
