import { Web3Provider } from '@ethersproject/providers';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import { CHAINS, ChainId } from '@pangolindex/sdk';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { usePair } from 'src/data/Reserves';
import { useTotalSupply } from 'src/data/TotalSupply';
import { useTotalSupplyHook } from 'src/data/multiChainsHooks';
import { PangolinWeb3Provider, useLibrary } from 'src/hooks';
import { useAllTokens } from 'src/hooks/useAllTokens';
import { useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import {
  useContract,
  useMulticallContract,
  usePairContract,
  usePngContract,
  useStakingContract,
  useTokenContract,
} from 'src/hooks/useContract';
import useDebounce from 'src/hooks/useDebounce';
import useENS from 'src/hooks/useENS';
import useInterval from 'src/hooks/useInterval';
import useIsWindowVisible from 'src/hooks/useIsWindowVisible';
import { useOnClickOutside } from 'src/hooks/useOnClickOutside';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice/evm';
import ApplicationUpdater from 'src/state/papplication/updater';
import { useCoinGeckoTokenData } from 'src/state/pcoingecko/hooks';
import ListsUpdater from 'src/state/plists/updater';
import MulticallUpdater from 'src/state/pmulticall/updater';
import { usePangoChefInfosHook } from 'src/state/ppangoChef/hooks';
import {
  calculateTotalStakedAmountInAvax,
  calculateTotalStakedAmountInAvaxFromPng,
  fetchChunkedAprs,
  fetchMinichefData,
  useDerivedStakeInfo,
  useGetAllFarmData,
  useMinichefPools,
  useMinichefStakingInfos,
} from 'src/state/pstake/hooks';
import {
  useGetAllFarmDataHook,
  useGetMinichefStakingInfosViaSubgraphHook,
  useMinichefStakingInfosHook,
} from 'src/state/pstake/multiChainsHooks';
import {
  DoubleSideStaking,
  DoubleSideStakingInfo,
  MinichefStakingInfo,
  PoolType,
  StakingInfo,
} from 'src/state/pstake/types';
import { useGelatoLimitOrdersListHook } from 'src/state/pswap/hooks';
import {
  LimitOrderInfo,
  useDerivedSwapInfo,
  useGelatoLimitOrderDetail,
  useSwapActionHandlers,
} from 'src/state/pswap/hooks/common';

import { useAllTransactions, useAllTransactionsClearer } from 'src/state/ptransactions/hooks';
import TransactionUpdater from 'src/state/ptransactions/updater';
import { useAccountBalanceHook, useTokenBalanceHook } from 'src/state/pwallet/hooks';
import { useGetUserLP, useTokenBalance } from 'src/state/pwallet/hooks/evm';
import { existSarContract, getEtherscanLink, isEvmChain, shortenAddress, shortenAddressMapping } from 'src/utils';
import chunkArray from 'src/utils/chunkArray';
import listVersionLabel from 'src/utils/listVersionLabel';
import { nearFn } from 'src/utils/near';
import { parseENSAddress } from 'src/utils/parseENSAddress';
import { splitQuery } from 'src/utils/query';
import uriToHttp from 'src/utils/uriToHttp';
import { unwrappedToken, wrappedCurrency, wrappedCurrencyAmount } from 'src/utils/wrappedCurrency';
import { MixPanelEvents, MixPanelProvider, useMixpanel } from './hooks/mixpanel';
import i18n, { availableLanguages } from './i18n';
import store, { PANGOLIN_PERSISTED_KEYS, StoreContext, galetoStore, pangolinReducers } from './state';
import { PangoChefInfo } from './state/ppangoChef/types';
import { useSarPositionsHook } from './state/psarstake/hooks';
import { useSarStakeInfo } from './state/psarstake/hooks/evm';
import { Position } from './state/psarstake/types';
import SwapUpdater from './state/pswap/updater';
import { default as ThemeProvider } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

export function PangolinProvider({
  chainId = ChainId.AVALANCHE,
  library,
  children,
  account,
  theme,
  mixpanelToken,
}: {
  chainId: number | undefined;
  library: any | undefined;
  account: string | undefined;
  children?: React.ReactNode;
  theme?: any;
  mixpanelToken?: string;
}) {
  const ethersLibrary = library && !library?._isProvider ? new Web3Provider(library) : library;

  return (
    <Provider store={store} context={StoreContext}>
      <PangolinWeb3Provider chainId={chainId} library={library} account={account} key={chainId}>
        <MixPanelProvider mixpanelToken={mixpanelToken}>
          <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
              <ListsUpdater />
              <ApplicationUpdater />
              <MulticallUpdater />
              <TransactionUpdater />
              <SwapUpdater />
              {isEvmChain(chainId) && CHAINS[chainId]?.supported_by_gelato ? (
                <Provider store={galetoStore}>
                  <GelatoProvider
                    library={ethersLibrary}
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
        </MixPanelProvider>
      </PangolinWeb3Provider>
    </Provider>
  );
}

export * from './constants';
export { SUPPORTED_WALLETS } from './constants/wallets';
export { ROUTER_ADDRESS, MINICHEF_ADDRESS } from './constants/address';
export { TIMEFRAME, SwapTypes } from './constants/swap';
export * from './connectors';
export * from './components';
export * from './state/papplication/hooks';
export * from './state/papplication/actions';
export * as Tokens from './constants/tokens';

export * from '@gelatonetwork/limit-orders-react';
export type {
  LimitOrderInfo,
  MinichefStakingInfo,
  DoubleSideStakingInfo,
  StakingInfo,
  DoubleSideStaking,
  Position,
  PangoChefInfo,
};

// components
export { SelectTokenDrawer };

// galeto hooks
export { useGelatoLimitOrderDetail, useGelatoLimitOrdersListHook };

// hooks
export {
  useSarStakeInfo,
  useSarPositionsHook,
  useDerivedSwapInfo,
  useUSDCPrice,
  useAllTokens,
  usePair,
  useSwapActionHandlers,
  useLibrary,
  useAllTransactions,
  useAllTransactionsClearer,
  useAccountBalanceHook,
  useTranslation,
  useMinichefStakingInfosHook,
  useGetAllFarmData,
  useGetMinichefStakingInfosViaSubgraphHook,
  useGetUserLP,
  useMinichefStakingInfos,
  useDerivedStakeInfo,
  useMinichefPools,
  useTotalSupplyHook,
  useTotalSupply,
  useGetAllFarmDataHook,
  useTokenBalanceHook,
  useTokenBalance,
  usePangoChefInfosHook,
  useUSDCPriceHook,
  useParsedQueryString,
  useMixpanel,
  useCoinGeckoTokenData,
  useDebounce,
  useOnClickOutside,
  useInterval,
  useIsWindowVisible,
  useENS,
  usePngContract,
  useStakingContract,
  useMulticallContract,
  usePairContract,
  useTokenContract,
  useContract,
  useApproveCallbackHook,
};

// misc
export {
  pangolinReducers,
  PANGOLIN_PERSISTED_KEYS,
  wrappedCurrency,
  wrappedCurrencyAmount,
  unwrappedToken,
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
  getEtherscanLink,
  shortenAddress,
  shortenAddressMapping,
  MixPanelEvents,
  chunkArray,
  uriToHttp,
  parseENSAddress,
  listVersionLabel,
  splitQuery,
  ApprovalState as TransactionApprovalState,
};
