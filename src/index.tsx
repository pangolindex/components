import React from 'react';
import { pangolinReducers, PANGOLIN_PERSISTED_KEYS } from './state';
import { Web3Provider } from './hooks';
import ApplicationUpdater from './state/papplication/updater';
import ListsUpdater from './state/plists/updater';
import MulticallUpdater from './state/pmulticall/updater';
import TransactionUpdater from './state/ptransactions/updater';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import { default as ThemeProvider } from './theme';
import { useGelatoLimitOrderDetail, LimitOrderInfo, useGelatoLimitOrderList } from 'src/state/pswap/hooks';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer'
import { useDerivedSwapInfo,useSwapActionHandlers } from 'src/state/pswap/hooks'
import useUSDCPrice from 'src/utils/useUSDCPrice'
import { useAllTokens } from 'src/hooks/Tokens'
import { usePair } from 'src/data/Reserves'
import { wrappedCurrency } from 'src/utils/wrappedCurrency'


export function PangolinProvider({
  chainId,
  library,
  children,
  account,
  theme,
}: {
  chainId: number | undefined;
  library: any | undefined;
  account: string | undefined;
  children?: React.ReactNode;
  theme: any;
}) {
  return (
    <Web3Provider chainId={chainId} library={library} account={account}>
      <ListsUpdater />
      <ApplicationUpdater />
      <MulticallUpdater />
      <TransactionUpdater />
      <ThemeProvider theme={theme}>
        <GelatoProvider
          library={library}
          chainId={chainId}
          account={account ?? undefined}
          useDefaultTheme={false}
          handler={'pangolin'}
        >
          {children}
        </GelatoProvider>
      </ThemeProvider>
    </Web3Provider>
  );
}

export * from './components';
export * from '@gelatonetwork/limit-orders-react';
export type { LimitOrderInfo };
export {
  pangolinReducers,
  PANGOLIN_PERSISTED_KEYS,
  useGelatoLimitOrderDetail,
  useGelatoLimitOrderList,
  SelectTokenDrawer,
  useDerivedSwapInfo,
  useUSDCPrice,
  useAllTokens,
  usePair,
  useSwapActionHandlers,
  wrappedCurrency
};
