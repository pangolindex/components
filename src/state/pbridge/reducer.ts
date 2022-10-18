import { createReducer } from '@reduxjs/toolkit';
import {
  ChainField,
  CurrencyField,
  changeRouteLoaderStatus,
  replaceBridgeState,
  selectChain,
  selectCurrency,
  selectRoute,
  setRecipient,
  setRoutes,
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
  // the typed btc address
  readonly recipient: string | null;
  readonly routes: Route[];
  readonly selectedRoute: number;
  readonly routesLoaderStatus: boolean;
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
  selectedRoute: 0,
  routesLoaderStatus: false,
};

export default createReducer<BridgeState>(initialState, (builder) =>
  builder
    .addCase(
      replaceBridgeState,
      (state, { payload: { recipient, inputCurrencyId, outputCurrencyId, fromChainId, toChainId } }) => {
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
          recipient,
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
      };
    }),
);
