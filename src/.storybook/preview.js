import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PangolinProvider } from '..';
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core';
import { NetworkContextName } from '../constants';
import getLibrary from '../utils/getLibrary';
import { InjectedConnector } from '@pangolindex/web3-react-injected-connector';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import store from '../state';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

function useWeb3() {
  const context = useWeb3ReactCore();
  return context;
}

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 43114],
});

const InternalProvider = ({ children }) => {
  const { library, chainId, account, activate } = useWeb3();
  useEffect(() => {
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
