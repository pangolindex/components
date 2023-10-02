import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { ElixirVault, ElixirVaultDetail, Field, TransactionStatus } from './types';

export interface ElixirVaultState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly [Field.CURRENCY_A]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.CURRENCY_B]: {
    readonly currencyId: string | undefined;
  };
  readonly elixirVaults: ElixirVault[];
  readonly selectedElixirVault: number | undefined;
  readonly selectedVaultDetails: ElixirVaultDetail | undefined;
  readonly elixirVaultsLoaderStatus: boolean;
  readonly depositTransactionLoaderStatus: boolean;
  readonly depositTransactionError: Error | undefined;
  readonly depositTransactionStatus: TransactionStatus | undefined;
}

const initialElixirVaultState: ElixirVaultState = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  [Field.CURRENCY_A]: {
    currencyId: '',
  },
  [Field.CURRENCY_B]: {
    currencyId: '',
  },
  elixirVaults: [],
  selectedElixirVault: undefined,
  selectedVaultDetails: undefined,
  elixirVaultsLoaderStatus: false,
  depositTransactionLoaderStatus: false,
  depositTransactionError: undefined,
  depositTransactionStatus: undefined,
};

const elixirVaultStateAtom = atom<ElixirVaultState>(initialElixirVaultState);

export const useElixirVaultStateAtom = () => {
  const [elixirVaultState, setElixirVaultState] = useAtom(elixirVaultStateAtom);

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

  const clearTransactionData = useCallback(() => {
    setElixirVaultState((state) => ({
      ...state,
      transactionLoaderStatus: false,
      transactionError: undefined,
      transactionStatus: undefined,
    }));
  }, [setElixirVaultState]);

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

  const changeDepositTransactionLoaderStatus = useCallback(
    ({ depositTransactionLoaderStatus, depositTransactionStatus }) => {
      setElixirVaultState((state) => ({
        ...state,
        depositTransactionLoaderStatus,
        depositTransactionStatus,
      }));
    },
    [setElixirVaultState],
  );

  const setDepositTransactionError = useCallback(
    ({ depositTransactionError }) => {
      setElixirVaultState((state) => ({
        ...state,
        depositTransactionError,
      }));
    },
    [setElixirVaultState],
  );

  // pmint - Mint actions
  const setTypeInput = useCallback(
    ({ field, typedValue }: { field: Field; typedValue: string }) => {
      setElixirVaultState((state) => ({
        ...state,
        independentField: field,
        typedValue,
      }));
    },
    [setElixirVaultState, elixirVaultState],
  );

  const selectCurrency = useCallback(
    ({ currencyId, field }: { currencyId: string; field: Field }) => {
      const otherField = field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

      if (currencyId === elixirVaultState[otherField].currencyId) {
        // the case where we have to swap the order
        setElixirVaultState((prev) => ({
          ...prev,
          independentField: prev?.independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: prev[field].currencyId },
        }));
      } else {
        // the normal case
        setElixirVaultState((prev) => ({
          ...prev,
          [field]: { currencyId: currencyId },
        }));
      }
    },
    [setElixirVaultState, elixirVaultState],
  );

  const resetState = useCallback(() => {
    setElixirVaultState(initialElixirVaultState);
  }, [setElixirVaultState]);

  const resetMintStateOnToggle = useCallback(() => {
    setElixirVaultState((state) => ({
      ...state,
      typedValue: '',
    }));
  }, [setElixirVaultState]);

  return {
    elixirVaultState,
    setElixirVaultDetail,
    resetState,
    resetSelectedVaultDetails,
    selectElixirVault,
    changeElixirVaultLoaderStatus,
    clearTransactionData,
    setElixirVaults,
    changeDepositTransactionLoaderStatus,
    setDepositTransactionError,
    resetMintStateOnToggle,
    selectCurrency,
    setTypeInput,
  };
};
