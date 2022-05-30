import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PangolinProvider } from '..';
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core';
import { NetworkContextName } from '../constants';
import getLibrary from '../utils/getLibrary';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import store from '../state';
import { injected } from '../connectors';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const InternalProvider = ({ children }) => {
  const context = useWeb3ReactCore();
  const { library, chainId, account, activate } = context;

  useEffect(() => {
    // try to connect on page reload
    if (activate) {
      activate(injected);
    }
  }, []);

  return (
    <PangolinProvider library={library} chainId={chainId} account={account ?? undefined}>
      {children}
    </PangolinProvider>
  );
};

export const decorators = [
  (Story) => (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <InternalProvider>
            <Story />
          </InternalProvider>
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
