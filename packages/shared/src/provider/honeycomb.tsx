import { ChainId } from '@pangolindex/sdk';
// import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { network } from '@honeycomb-finance/wallet-connectors';
// import { NetworkContextName } from 'src/constants';
import { MixPanelProvider } from 'src/hooks/mixpanel';
// import { useEagerConnect, useWalletUpdater } from './hooks/useConnector';
import { ThemeProvider } from 'src/theme';
import { HasuraContext } from './hasura';
import { HoneycombWeb3Provider } from './pangolin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

interface Config {
  mixpanelToken?: string;
  hasuraApiKey?: string;
}

export function HoneycombProvider({
  chainId = ChainId.AVALANCHE,
  library,
  children,
  account,
  theme,
  config,
}: {
  chainId: number | undefined;
  library: any | undefined;
  account: string | undefined;
  children?: React.ReactNode;
  theme?: any;
  config?: Config;
}) {
  //TODO: need to add updator and uncomment this code
  // const { active, error, connector } = useWeb3React();
  // const { activate: activeNetwork } = useWeb3React(NetworkContextName);

  // const tryToActiveEager = !library || !account;
  // try to eagerly connect to a wallet, if it exists and has granted access already
  //const triedEager = useEagerConnect(tryToActiveEager);

  // active the network connector only when no error,
  // and not is active or there is not connector
  // and tried to connect to previous wallet
  // useEffect(() => {
  //   if (triedEager && (!active || !connector) && !error) {
  //     //activeNetwork(network);
  //   }
  // }, [triedEager, connector, active, error, activeNetwork]);

  //useWalletUpdater();

  //const ethersLibrary = library && !library?._isProvider ? new Web3Provider(library) : library;

  return (
    <HoneycombWeb3Provider chainId={chainId} library={library} account={account} key={chainId}>
      <MixPanelProvider mixpanelToken={config?.mixpanelToken}>
        <HasuraContext.Provider value={config?.hasuraApiKey}>
          <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}> {children}</QueryClientProvider>
          </ThemeProvider>
        </HasuraContext.Provider>
      </MixPanelProvider>
    </HoneycombWeb3Provider>
  );
}
