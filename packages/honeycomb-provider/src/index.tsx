import {
  HasuraContext,
  HoneycombWeb3Provider,
  MixPanelProvider,
  NetworkContextName,
  ThemeProvider,
} from '@honeycomb-finance/shared';
import { ApplicationUpdater, ListsUpdater, MulticallUpdater, TransactionUpdater } from '@honeycomb-finance/state-hooks';
import { network } from '@honeycomb-finance/wallet-connectors';
import { ChainId } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEagerConnect, useWalletUpdater } from './useConnector';

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
  const { active, error, connector } = useWeb3React();
  const { activate: activeNetwork } = useWeb3React(NetworkContextName);

  const tryToActiveEager = !library || !account;
  // try to eagerly connect to a wallet, if it exists and has granted access already
  const triedEager = useEagerConnect(tryToActiveEager);

  // active the network connector only when no error,
  // and not is active or there is not connector
  // and tried to connect to previous wallet
  useEffect(() => {
    if (triedEager && (!active || !connector) && !error) {
      activeNetwork(network);
    }
  }, [triedEager, connector, active, error, activeNetwork]);

  useWalletUpdater();

  return (
    <HoneycombWeb3Provider chainId={chainId} library={library} account={account} key={chainId}>
      <MixPanelProvider mixpanelToken={config?.mixpanelToken}>
        <HasuraContext.Provider value={config?.hasuraApiKey}>
          <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
              <ListsUpdater />
              <ApplicationUpdater />
              <MulticallUpdater />
              <TransactionUpdater />
              {children}
            </QueryClientProvider>
          </ThemeProvider>
        </HasuraContext.Provider>
      </MixPanelProvider>
    </HoneycombWeb3Provider>
  );
}
