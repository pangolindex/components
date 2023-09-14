import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { CurrencyField, ElixirVault, ElixirVaultDetail, TransactionStatus } from './types';

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
  readonly selectedVaultDetails: ElixirVaultDetail | undefined;
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
  selectedVaultDetails: undefined,
  elixirVaultsLoaderStatus: false,
  transactionLoaderStatus: false,
  transactionError: undefined,
  transactionStatus: undefined,
};

const elixirVaultStateAtom = atom<ElixirVaultState>(initialElixirVaultState);

export const useElixirVaultStateAtom = () => {
  const [elixirVaultState, setElixirVaultState] = useAtom(elixirVaultStateAtom);

  const replaceElixirVaultState = useCallback(
    ({ inputCurrencyId, outputCurrencyId }) => {
      setElixirVaultState((state) => ({
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
    [setElixirVaultState],
  );

  const selectCurrency = useCallback(
    ({ currencyId, field }) => {
      setElixirVaultState((state) => ({
        ...state,
        [field]: { currencyId: currencyId },
      }));
    },
    [setElixirVaultState],
  );

  const selectElixirVault = useCallback(
    ({ selectedElixirVault }) => {
      setElixirVaultState((state) => ({
        ...state,
        elixirVaults: state.elixirVaults.map((vault, index) => {
          return {
            ...vault,
            selected: index === selectedElixirVault,
          };
        }),
      }));
    },
    [setElixirVaultState],
  );

  const changeElixirVaultLoaderStatus = useCallback(
    ({ elixirVaultsLoaderStatus }) => {
      setElixirVaultState((state) => ({
        ...state,
        elixirVaultsLoaderStatus,
      }));
    },
    [setElixirVaultState],
  );

  const typeAmount = useCallback(
    ({ field, typedValue }) => {
      setElixirVaultState((state) => ({
        ...state,
        field: field,
        typedValue,
      }));
    },
    [setElixirVaultState],
  );

  const switchCurrencies = useCallback(() => {
    setElixirVaultState((state) => ({
      ...state,
      [CurrencyField.CURRENCY0]: { currencyId: state[CurrencyField.CURRENCY0].currencyId },
      [CurrencyField.CURRENCY1]: { currencyId: state[CurrencyField.CURRENCY1].currencyId },
    }));
  }, [setElixirVaultState]);

  const clearTransactionData = useCallback(() => {
    setElixirVaultState((state) => ({
      ...state,
      transactionLoaderStatus: false,
      transactionError: undefined,
      transactionStatus: undefined,
    }));
  }, [setElixirVaultState]);

  const setRecipient = useCallback(
    ({ recipient }) => {
      setElixirVaultState((state) => ({
        ...state,
        recipient,
      }));
    },
    [setElixirVaultState],
  );

  const setElixirVaults = useCallback(
    ({ elixirVaults, elixirVaultsLoaderStatus }) => {
      setElixirVaultState((state) => ({
        ...state,
        elixirVaults,
        elixirVaultsLoaderStatus,
        selectedElixirVault: undefined,
      }));
    },
    [setElixirVaultState],
  );

  const setElixirVaultDetail = useCallback(
    ({ selectedVaultDetails }) => {
      setElixirVaultState((state) => ({
        ...state,
        selectedVaultDetails,
      }));
    },
    [setElixirVaultState],
  );

  const resetSelectedVaultDetails = useCallback(() => {
    setElixirVaultState((state) => ({
      ...state,
      selectedVaultDetails: undefined,
    }));
  }, [setElixirVaultState]);

  const changeTransactionLoaderStatus = useCallback(
    ({ transactionLoaderStatus, transactionStatus }) => {
      setElixirVaultState((state) => ({
        ...state,
        transactionLoaderStatus,
        transactionStatus,
      }));
    },
    [setElixirVaultState],
  );

  const setTransactionError = useCallback(
    ({ transactionError }) => {
      setElixirVaultState((state) => ({
        ...state,
        transactionError,
      }));
    },
    [setElixirVaultState],
  );

  return {
    elixirVaultState,
    replaceElixirVaultState,
    setElixirVaultDetail,
    resetSelectedVaultDetails,
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
