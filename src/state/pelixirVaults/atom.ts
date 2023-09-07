import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { CurrencyField, ElixirVault, TransactionStatus } from './types';

export interface ElixirVaultState {
  readonly typedValue: string;
  readonly [CurrencyField.CURRENCY0]: {
    readonly currencyId: string | undefined;
  };
  readonly [CurrencyField.CURRENCY1]: {
    readonly currencyId: string | undefined;
  };
  readonly elixirVaults: ElixirVault[];
  readonly selectedElixirVault: number | undefined;
  readonly elixirVaultsLoaderStatus: boolean;
  readonly transactionLoaderStatus: boolean;
  readonly transactionError: Error | undefined;
  readonly transactionStatus: TransactionStatus | undefined;
}

const initialElixirVaultState: ElixirVaultState = {
  typedValue: '',
  [CurrencyField.CURRENCY0]: {
    currencyId: '',
  },
  [CurrencyField.CURRENCY1]: {
    currencyId: '',
  },
  elixirVaults: [],
  selectedElixirVault: undefined,
  elixirVaultsLoaderStatus: false,
  transactionLoaderStatus: false,
  transactionError: undefined,
  transactionStatus: undefined,
};

const elixirVaultStateAtom = atom<ElixirVaultState>(initialElixirVaultState);

export const useElixirVaultStateAtom = () => {
  const [elixirVaultState, setBridgeState] = useAtom(elixirVaultStateAtom);

  const replaceBridgeState = useCallback(
    ({ inputCurrencyId, outputCurrencyId }) => {
      setBridgeState((state) => ({
        ...state,
        typedValue: '',
        [CurrencyField.CURRENCY0]: {
          currencyId: inputCurrencyId,
        },
        [CurrencyField.CURRENCY1]: {
          currencyId: outputCurrencyId,
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

  const selectElixirVault = useCallback(
    ({ selectedElixirVault }) => {
      setBridgeState((state) => ({
        ...state,
        elixirVaults: state.elixirVaults.map((vault, index) => {
          return {
            ...vault,
            selected: index === selectedElixirVault,
          };
        }),
      }));
    },
    [setBridgeState],
  );

  const changeElixirVaultLoaderStatus = useCallback(
    ({ elixirVaultsLoaderStatus }) => {
      setBridgeState((state) => ({
        ...state,
        elixirVaultsLoaderStatus,
      }));
    },
    [setBridgeState],
  );

  const typeAmount = useCallback(
    ({ field, typedValue }) => {
      setBridgeState((state) => ({
        ...state,
        field: field,
        typedValue,
      }));
    },
    [setBridgeState],
  );

  const switchCurrencies = useCallback(() => {
    setBridgeState((state) => ({
      ...state,
      [CurrencyField.CURRENCY0]: { currencyId: state[CurrencyField.CURRENCY0].currencyId },
      [CurrencyField.CURRENCY1]: { currencyId: state[CurrencyField.CURRENCY1].currencyId },
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

  const setElixirVaults = useCallback(
    ({ elixirVaults, elixirVaultsLoaderStatus }) => {
      setBridgeState((state) => ({
        ...state,
        elixirVaults,
        elixirVaultsLoaderStatus,
        selectedElixirVault: undefined,
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
    elixirVaultState,
    replaceBridgeState,
    selectCurrency,
    selectElixirVault,
    changeElixirVaultLoaderStatus,
    typeAmount,
    switchCurrencies,
    clearTransactionData,
    setRecipient,
    setElixirVaults,
    changeTransactionLoaderStatus,
    setTransactionError,
  };
};
