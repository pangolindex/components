import { TransactionResponse } from '@ethersproject/providers';
import { useGelatoLimitOrders } from '@gelatonetwork/limit-orders-react';
import { ChainId } from '@pangolindex/sdk';
import { useGelatoLimitOrderList } from './common';

const useDummyGelatoLimitOrdersList = () => [];

export type UseGelatoLimitOrdersListHookType = {
  [chainId in ChainId]: typeof useGelatoLimitOrderList | typeof useDummyGelatoLimitOrdersList;
};

export const useGelatoLimitOrdersListHook: UseGelatoLimitOrdersListHookType = {
  [ChainId.AVALANCHE]: useGelatoLimitOrderList,
  [ChainId.FUJI]: useGelatoLimitOrderList,
  [ChainId.WAGMI]: useGelatoLimitOrderList,
  [ChainId.COSTON]: useDummyGelatoLimitOrdersList,
  [ChainId.SONGBIRD]: useDummyGelatoLimitOrdersList,
  [ChainId.FLARE_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.HEDERA_TESTNET]: useDummyGelatoLimitOrdersList,
  [ChainId.HEDERA_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.NEAR_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.NEAR_TESTNET]: useDummyGelatoLimitOrdersList,
  [ChainId.COSTON2]: useDummyGelatoLimitOrdersList,
  [ChainId.EVMOS_TESTNET]: useDummyGelatoLimitOrdersList,
  [ChainId.EVMOS_MAINNET]: useDummyGelatoLimitOrdersList,
  //TODO: Change following chains
  [ChainId.ETHEREUM]: useDummyGelatoLimitOrdersList,
  [ChainId.POLYGON]: useDummyGelatoLimitOrdersList,
  [ChainId.FANTOM]: useDummyGelatoLimitOrdersList,
  [ChainId.XDAI]: useDummyGelatoLimitOrdersList,
  [ChainId.BSC]: useDummyGelatoLimitOrdersList,
  [ChainId.ARBITRUM]: useDummyGelatoLimitOrdersList,
  [ChainId.CELO]: useDummyGelatoLimitOrdersList,
  [ChainId.OKXCHAIN]: useDummyGelatoLimitOrdersList,
  [ChainId.VELAS]: useDummyGelatoLimitOrdersList,
  [ChainId.AURORA]: useDummyGelatoLimitOrdersList,
  [ChainId.CRONOS]: useDummyGelatoLimitOrdersList,
  [ChainId.FUSE]: useDummyGelatoLimitOrdersList,
  [ChainId.MOONRIVER]: useDummyGelatoLimitOrdersList,
  [ChainId.MOONBEAM]: useDummyGelatoLimitOrdersList,
  [ChainId.OP]: useDummyGelatoLimitOrdersList,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyGelatoLimitOrdersList,
};

const useDummyGelatoLimitOrders = () => ({
  handlers: {
    handleLimitOrderSubmission: () => ({} as Promise<TransactionResponse>),
    handleLimitOrderCancellation: () => ({} as Promise<TransactionResponse>),
    handleInput: () => {},
    handleCurrencySelection: () => {},
    handleSwitchTokens: () => {},
    handleRateType: () => {},
  },
  derivedOrderInfo: {
    currencies: {
      input: undefined,
      output: undefined,
    },
    currencyBalances: {
      input: undefined,
      output: undefined,
    },
    inputError: undefined,
    trade: undefined,
    parsedAmounts: {
      input: undefined,
      output: undefined,
    },
    formattedAmounts: {
      input: '0',
      output: '0',
      price: '0',
    },
    rawAmounts: {
      input: undefined,
      output: undefined,
    },
    price: undefined,
  },
  orderState: {
    independentField: 'INPUT' as any,
    typedValue: '0',
    inputValue: undefined,
    INPUT: {
      currencyId: undefined,
    },
    OUTPUT: {
      currencyId: undefined,
    },
    recipient: null,
    rateType: 'MUL' as any,
  },
});

export type useGelatoLimitiOrdersHookType = {
  [chainId in ChainId]: typeof useGelatoLimitOrders | typeof useDummyGelatoLimitOrders;
};

export const useGelatoLimitOrdersHook: useGelatoLimitiOrdersHookType = {
  [ChainId.AVALANCHE]: useGelatoLimitOrders,
  [ChainId.FUJI]: useDummyGelatoLimitOrders,
  [ChainId.WAGMI]: useDummyGelatoLimitOrders,
  [ChainId.COSTON]: useDummyGelatoLimitOrders,
  [ChainId.SONGBIRD]: useDummyGelatoLimitOrders,
  [ChainId.FLARE_MAINNET]: useDummyGelatoLimitOrders,
  [ChainId.HEDERA_TESTNET]: useDummyGelatoLimitOrders,
  [ChainId.HEDERA_MAINNET]: useDummyGelatoLimitOrders,
  [ChainId.NEAR_MAINNET]: useDummyGelatoLimitOrders,
  [ChainId.NEAR_TESTNET]: useDummyGelatoLimitOrders,
  [ChainId.COSTON2]: useDummyGelatoLimitOrders,
  [ChainId.EVMOS_TESTNET]: useDummyGelatoLimitOrders,
  [ChainId.EVMOS_MAINNET]: useDummyGelatoLimitOrders,
  [ChainId.ETHEREUM]: useGelatoLimitOrders,
  [ChainId.POLYGON]: useGelatoLimitOrders,
  [ChainId.FANTOM]: useGelatoLimitOrders,
  [ChainId.XDAI]: useGelatoLimitOrders,
  [ChainId.BSC]: useGelatoLimitOrders,
  [ChainId.ARBITRUM]: useGelatoLimitOrders,
  [ChainId.CELO]: useDummyGelatoLimitOrders,
  [ChainId.OKXCHAIN]: useDummyGelatoLimitOrders,
  [ChainId.VELAS]: useDummyGelatoLimitOrders,
  [ChainId.AURORA]: useDummyGelatoLimitOrders,
  [ChainId.CRONOS]: useGelatoLimitOrders,
  [ChainId.FUSE]: useDummyGelatoLimitOrders,
  [ChainId.MOONRIVER]: useGelatoLimitOrders,
  [ChainId.MOONBEAM]: useGelatoLimitOrders,
  [ChainId.OP]: useGelatoLimitOrders,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyGelatoLimitOrders,
};
