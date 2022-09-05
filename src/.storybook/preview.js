import React, { useEffect } from 'react';
import { PangolinProvider } from '..';
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core';
import { NetworkContextName } from '../constants';
import getLibrary from '../utils/getLibrary';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { injected } from '../connectors';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const InternalProvider = ({ children, theme }) => {
  const context = useWeb3ReactCore();
  const { library, chainId, account, activate } = context;

  useEffect(() => {
    // try to connect on page reload
    if (activate) {
      activate(injected);
    }
  }, []);

  return (
    <PangolinProvider library={library} chainId={chainId} account={account ?? undefined} theme={theme}>
      {children}
    </PangolinProvider>
  );
};

export const decorators = [
  (Story, metadata) => {
    const theme = metadata.args.theme ?? undefined;
    return (
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <InternalProvider theme={theme}>
            <Story />
          </InternalProvider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    );
  },
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
