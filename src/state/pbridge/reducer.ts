import { createReducer } from '@reduxjs/toolkit';
import {
  ChainField,
  CurrencyField,
  TransactionStatus,
  changeRouteLoaderStatus,
  changeTransactionLoaderStatus,
  clearTransactionData,
  replaceBridgeState,
  selectChain,
  selectCurrency,
  selectRoute,
  setRecipient,
  setRoutes,
  setTransactionError,
  switchChains,
  switchCurrencies,
  typeAmount,
} from './actions';
import { Route } from './types';

export interface BridgeState {
  readonly typedValue: string;
  readonly [CurrencyField.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [CurrencyField.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [ChainField.FROM]: {
    readonly chainId: string | undefined;
  };
  readonly [ChainField.TO]: {
    readonly chainId: string | undefined;
  };
  readonly recipient: string | null;
  readonly routes: Route[];
  readonly selectedRoute: number | undefined;
  readonly routesLoaderStatus: boolean;
  readonly transactionLoaderStatus: boolean;
  readonly transactionError: Error | undefined;
  readonly transactionStatus: TransactionStatus | undefined;
}

const initialState: BridgeState = {
  typedValue: '',
  [CurrencyField.INPUT]: {
    currencyId: '',
  },
  [CurrencyField.OUTPUT]: {
    currencyId: '',
  },
  [ChainField.FROM]: {
    chainId: '',
  },
  [ChainField.TO]: {
    chainId: '',
  },
  recipient: null,
  routes: [],
  selectedRoute: undefined,
  routesLoaderStatus: false,
  transactionLoaderStatus: false,
  transactionError: undefined,
  transactionStatus: undefined,
};

export default createReducer<BridgeState>(initialState, (builder) =>
  builder
    .addCase(
      replaceBridgeState,
      (state, { payload: { inputCurrencyId, outputCurrencyId, fromChainId, toChainId } }) => {
        return {
          ...state,
          typedValue: '',
          [CurrencyField.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [CurrencyField.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          [ChainField.FROM]: {
            chainId: fromChainId,
          },
          [ChainField.TO]: {
            chainId: toChainId,
          },
        };
      },
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      return {
        ...state,
        [field]: { currencyId: currencyId },
      };
    })
    .addCase(selectRoute, (state, { payload: { selectedRoute } }) => {
      return {
        ...state,
        routes: state.routes.map((route, index) => {
          return {
            ...route,
            selected: index === selectedRoute,
          };
        }),
      };
    })
    .addCase(changeRouteLoaderStatus, (state, { payload: { routesLoaderStatus } }) => {
      return {
        ...state,
        routesLoaderStatus,
      };
    })
    .addCase(selectChain, (state, { payload: { chainId, field } }) => {
      return {
        ...state,
        [field]: { chainId: chainId },
      };
    })
    .addCase(typeAmount, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        field: field,
        typedValue,
      };
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        [CurrencyField.INPUT]: { currencyId: state[CurrencyField.OUTPUT].currencyId },
        [CurrencyField.OUTPUT]: { currencyId: state[CurrencyField.INPUT].currencyId },
      };
    })
    .addCase(switchChains, (state) => {
      return {
        ...state,
        [ChainField.FROM]: { chainId: state[ChainField.TO].chainId },
        [ChainField.TO]: { chainId: state[ChainField.FROM].chainId },
      };
    })
    .addCase(clearTransactionData, (state) => {
      return {
        ...state,
        transactionLoaderStatus: false,
        transactionError: undefined,
        transactionStatus: undefined,
      };
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      return {
        ...state,
        recipient,
      };
    })
    .addCase(setRoutes, (state, { payload: { routes, routesLoaderStatus } }) => {
      return {
        ...state,
        routes,
        routesLoaderStatus,
        selectedRoute: undefined,
      };
    })
    .addCase(changeTransactionLoaderStatus, (state, { payload: { transactionLoaderStatus, transactionStatus } }) => {
      return {
        ...state,
        transactionLoaderStatus,
        transactionStatus,
      };
    })
    .addCase(setTransactionError, (state, { payload: { transactionError } }) => {
      return {
        ...state,
        transactionError,
      };
    }),
);
