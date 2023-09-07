/* eslint-disable max-lines */
import { Currency } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { ElixirVaultState, useElixirVaultStateAtom } from './atom';
import { getElixirVaultsFromProviders } from './providers';
import { CurrencyField, ElixirVault, GetElixirVaultsProps, TransactionStatus } from './types';

export function useElixirVaultState(): ElixirVaultState {
  const { elixirVaultState } = useElixirVaultStateAtom();
  return elixirVaultState;
}

export function useElixirVaultActionHandlers(): {
  onCurrencySelection: (field: CurrencyField, currency: Currency) => void;
  onSwitchTokens: () => void;
  onSelectElixirVault: (elixirVault: ElixirVault) => void;
  onUserInput: (field: CurrencyField, typedValue: string) => void;
  onChangeElixirVaultLoaderStatus: () => void;
  onClearTransactionData: (transactionStatus: TransactionStatus) => void;
} {
  const {
    selectElixirVault,
    selectCurrency,
    switchCurrencies,
    clearTransactionData,
    setElixirVaults,
    typeAmount,
    changeElixirVaultLoaderStatus,
  } = useElixirVaultStateAtom();
  const { elixirVaults, elixirVaultsLoaderStatus } = useElixirVaultState();

  const onSelectElixirVault = (elixirVault: ElixirVault) => {
    const selectedElixirVaultIndex = elixirVaults.findIndex((r) => r === elixirVault);
    selectElixirVault({ selectedElixirVault: selectedElixirVaultIndex });
  };

  const onCurrencySelection = useCallback(
    (field: CurrencyField, currency: Currency) => {
      typeAmount({ field, typedValue: '0' }); //TODO:

      selectCurrency({
        field,
        currencyId: currency?.symbol || '',
      });
    },
    [selectCurrency, typeAmount],
  );

  const onSwitchTokens = useCallback(() => {
    switchCurrencies();
  }, [switchCurrencies]);

  const onClearTransactionData = useCallback(
    (transactionStatus?: TransactionStatus) => {
      clearTransactionData();
      if (transactionStatus === TransactionStatus.SUCCESS) {
        setElixirVaults({ elixirVaults: [], elixirVaultsLoaderStatus: false });
      }
    },
    [clearTransactionData, setElixirVaults],
  );

  const onUserInput = useCallback(
    (field: CurrencyField, typedValue: string) => {
      typeAmount({ field, typedValue });
    },
    [typeAmount],
  );

  const onChangeElixirVaultLoaderStatus = useCallback(() => {
    changeElixirVaultLoaderStatus({ elixirVaultsLoaderStatus: !elixirVaultsLoaderStatus });
  }, [changeElixirVaultLoaderStatus]);

  return {
    onSwitchTokens,
    onCurrencySelection,
    onSelectElixirVault,
    onUserInput,
    onChangeElixirVaultLoaderStatus,
    onClearTransactionData,
  };
}

export function useDerivedElixirVaultInfo(): {
  elixirVaults?: ElixirVault[];
  elixirVaultsLoaderStatus?: boolean;
} {
  const { elixirVaults, elixirVaultsLoaderStatus } = useElixirVaultState();

  return {
    elixirVaults,
    elixirVaultsLoaderStatus,
  };
}

export function useVaultActionHandlers(): {
  getVaults: (props: GetElixirVaultsProps) => void;
} {
  const { setElixirVaults } = useElixirVaultStateAtom();
  const getVaults = async (routesProps: GetElixirVaultsProps) => {
    const promises = Object.values(getElixirVaultsFromProviders).map((getVaults) => getVaults(routesProps));
    const elixirVaults = (await Promise.allSettled(promises)).flatMap((p) => (p.status === 'fulfilled' ? p.value : []));
    setElixirVaults({
      elixirVaults: elixirVaults.filter((x: ElixirVault | undefined) => !!x) as ElixirVault[],
      elixirVaultsLoaderStatus: false,
    });
  };

  return {
    getVaults,
  };
}
