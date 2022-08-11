import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import { CHAINS, ChainId } from '@pangolindex/sdk';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { usePair } from 'src/data/Reserves';
import { useTotalSupply, useTotalSupplyHook } from 'src/data/TotalSupply';
import { PangolinWeb3Provider, useLibrary } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { useActivePopups, useAddPopup, useRemovePopup } from 'src/state/papplication/hooks';
import {
  calculateTotalStakedAmountInAvax,
  calculateTotalStakedAmountInAvaxFromPng,
  fetchChunkedAprs,
  fetchMinichefData,
  useDerivedStakeInfo,
  useGetAllFarmData,
  useGetMinichefStakingInfosViaSubgraph,
  useMinichefPools,
  useMinichefStakingInfos,
  useMinichefStakingInfosMapping,
} from 'src/state/pstake/hooks';
import {
  DoubleSideStaking,
  DoubleSideStakingInfo,
  MinichefStakingInfo,
  PoolType,
  StakingInfo,
} from 'src/state/pstake/types';
import {
  LimitOrderInfo,
  useDerivedSwapInfo,
  useGelatoLimitOrderDetail,
  useGelatoLimitOrderList,
  useSwapActionHandlers,
} from 'src/state/pswap/hooks';
import { useAllTransactions, useAllTransactionsClearer } from 'src/state/ptransactions/hooks';
import { useAccountBalanceHook } from 'src/state/pwallet/multiChainsHooks';
import { existSarContract, shortenAddress } from 'src/utils';
import { nearFn } from 'src/utils/near';
import useUSDCPrice from 'src/utils/useUSDCPrice';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import i18n, { availableLanguages } from './i18n';
import store, { PANGOLIN_PERSISTED_KEYS, StoreContext, galetoStore, pangolinReducers } from './state';
import ApplicationUpdater from './state/papplication/updater';
import ListsUpdater from './state/plists/updater';
import { useGetUserLP } from './state/pmigrate/hooks';
import MulticallUpdater from './state/pmulticall/updater';
import { Position, useSarPositions, useSarStakeInfo } from './state/psarstake/hooks';
import SwapUpdater from './state/pswap/updater';
import TransactionUpdater from './state/ptransactions/updater';
import { default as ThemeProvider } from './theme';

const queryClient = new QueryClient();

export function PangolinProvider({
  chainId = ChainId.AVALANCHE,
  library,
  children,
  account,
  theme,
}: {
  chainId: number | undefined;
  library: any | undefined;
  account: string | undefined;
  children?: React.ReactNode;
  theme?: any;
}) {
  return (
    <Provider store={store} context={StoreContext}>
      <PangolinWeb3Provider chainId={chainId} library={library} account={account}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <ListsUpdater />
            <ApplicationUpdater />
            <MulticallUpdater />
            <TransactionUpdater />
            <SwapUpdater />
            {CHAINS[chainId]?.evm ? (
              <Provider store={galetoStore}>
                <GelatoProvider
                  library={library}
                  chainId={chainId}
                  account={account ?? undefined}
                  useDefaultTheme={false}
                  handler={'pangolin'}
                >
                  {children}
                </GelatoProvider>
              </Provider>
            ) : (
              children
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </PangolinWeb3Provider>
    </Provider>
  );
}

export * from './constants';
export * from './connectors';
export * from './components';

export * from '@gelatonetwork/limit-orders-react';
export type { LimitOrderInfo, MinichefStakingInfo, DoubleSideStakingInfo, StakingInfo, DoubleSideStaking, Position };

// components
export { SelectTokenDrawer };

// galeto hooks
export { useGelatoLimitOrderDetail, useGelatoLimitOrderList };

// hooks
export {
  useSarStakeInfo,
  useSarPositions,
  useDerivedSwapInfo,
  useUSDCPrice,
  useAllTokens,
  useActivePopups,
  useRemovePopup,
  useAddPopup,
  usePair,
  useSwapActionHandlers,
  useLibrary,
  shortenAddress,
  useAllTransactions,
  useAllTransactionsClearer,
  useAccountBalanceHook,
  useTranslation,
  useMinichefStakingInfosMapping,
  useGetAllFarmData,
  useGetMinichefStakingInfosViaSubgraph,
  useGetUserLP,
  useMinichefStakingInfos,
  useDerivedStakeInfo,
  useMinichefPools,
  useTotalSupplyHook,
  useTotalSupply,
};

// misc
export {
  pangolinReducers,
  PANGOLIN_PERSISTED_KEYS,
  wrappedCurrency,
  nearFn,
  i18n,
  availableLanguages,
  Trans,
  PoolType,
  fetchMinichefData,
  fetchChunkedAprs,
  calculateTotalStakedAmountInAvax,
  calculateTotalStakedAmountInAvaxFromPng,
  existSarContract,
};
