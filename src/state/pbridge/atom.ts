import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { Route } from './types';

export enum ChainField {
  FROM = 'FROM',
  TO = 'TO',
}

export enum CurrencyField {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

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

const initialBridgeState: BridgeState = {
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

const bridgeStateAtom = atom<BridgeState>(initialBridgeState);

export const useBridgeStateAtom = () => {
  const [bridgeState, setBridgeState] = useAtom(bridgeStateAtom);

  const replaceBridgeState = useCallback(
    ({ inputCurrencyId, outputCurrencyId, fromChainId, toChainId }) => {
      setBridgeState((state) => ({
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
      }));
    },
    [setBridgeState],
  );

  const selectCurrency = useCallback(
    ({ currencyId, field }) => {
      setBridgeState((state) => ({
        ...state,
        [field]: { currencyId: currencyId },
      }));
    },
    [setBridgeState],
  );

  const selectRoute = useCallback(
    ({ selectedRoute }) => {
      setBridgeState((state) => ({
        ...state,
        routes: state.routes.map((route, index) => {
          return {
            ...route,
            selected: index === selectedRoute,
          };
        }),
      }));
    },
    [setBridgeState],
  );

  const changeRouteLoaderStatus = useCallback(
    ({ routesLoaderStatus }) => {
      setBridgeState((state) => ({
        ...state,
        routesLoaderStatus,
      }));
    },
    [setBridgeState],
  );

  const selectChain = useCallback(
    ({ chainId, field }) => {
      setBridgeState((state) => ({
        ...state,
        [field]: { chainId: chainId },
        ...(field === ChainField.TO && { recipient: '' }),
      }));
    },
    [setBridgeState],
  );

  const typeAmount = useCallback(
    ({ field, typedValue }) => {
      setBridgeState((state) => ({
        ...state,
        [field]: field,
        typedValue,
      }));
    },
    [setBridgeState],
  );

  const switchCurrencies = useCallback(() => {
    setBridgeState((state) => ({
      ...state,
      [CurrencyField.INPUT]: { currencyId: state[CurrencyField.OUTPUT].currencyId },
      [CurrencyField.OUTPUT]: { currencyId: state[CurrencyField.INPUT].currencyId },
    }));
  }, [setBridgeState]);

  const switchChains = useCallback(() => {
    setBridgeState((state) => ({
      ...state,
      [ChainField.FROM]: { chainId: state[ChainField.TO].chainId },
      [ChainField.TO]: { chainId: state[ChainField.FROM].chainId },
    }));
  }, [setBridgeState]);

  const clearTransactionData = useCallback(() => {
    setBridgeState((state) => ({
      ...state,
      transactionLoaderStatus: false,
      transactionError: undefined,
      transactionStatus: undefined,
    }));
  }, [setBridgeState]);

  const setRecipient = useCallback(
    ({ recipient }) => {
      setBridgeState((state) => ({
        ...state,
        recipient,
      }));
    },
    [setBridgeState],
  );

  const setRoutes = useCallback(
    ({ routes, routesLoaderStatus }) => {
      setBridgeState((state) => ({
        ...state,
        routes,
        routesLoaderStatus,
        selectedRoute: undefined,
      }));
    },
    [setBridgeState],
  );

  const changeTransactionLoaderStatus = useCallback(
    ({ transactionLoaderStatus, transactionStatus }) => {
      setBridgeState((state) => ({
        ...state,
        transactionLoaderStatus,
        transactionStatus,
      }));
    },
    [setBridgeState],
  );

  const setTransactionError = useCallback(
    ({ transactionError }) => {
      setBridgeState((state) => ({
        ...state,
        transactionError,
      }));
    },
    [setBridgeState],
  );

  return {
    bridgeState,
    replaceBridgeState,
    selectCurrency,
    selectRoute,
    changeRouteLoaderStatus,
    selectChain,
    typeAmount,
    switchCurrencies,
    switchChains,
    clearTransactionData,
    setRecipient,
    setRoutes,
    changeTransactionLoaderStatus,
    setTransactionError,
  };
};
