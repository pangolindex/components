import React from 'react';
import { Provider } from 'react-redux';
import ThemeProvider from '../theme';
import { NetworkContextName } from '../constants';
import { useActiveWeb3React } from '../hooks';
import getLibrary from '../utils/getLibrary';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import store from '../state';
import ListsUpdater from '../state/plists/updater';
import ApplicationUpdater from '../state/papplication/updater';
import MulticallUpdater from '../state/pmulticall/updater';
import TransactionUpdater from '../state/ptransactions/updater';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const Gelato = ({ children }) => {
  const { library, chainId, account } = useActiveWeb3React();
  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}
      useDefaultTheme={false}
      handler={'pangolin'}
    >
      {children}
    </GelatoProvider>
  );
};

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  );
}

export const decorators = [
  (Story) => (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <Updaters />
          <ThemeProvider>
            <Gelato>
              <Story />
            </Gelato>
          </ThemeProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
