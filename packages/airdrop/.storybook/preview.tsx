import React, { useEffect } from 'react';
import type { Preview } from '@storybook/react';
import { useWeb3React as useWeb3ReactCore, createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { ThemeProvider, PangolinWeb3Provider, NetworkContextName, getLibrary } from '@honeycomb-finance/shared';
import { QueryClient, QueryClientProvider } from 'react-query';
import { injected } from '@honeycomb-finance/wallet-connectors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

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
    <PangolinWeb3Provider chainId={chainId} library={library} account={account} key={chainId}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </PangolinWeb3Provider>
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

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
