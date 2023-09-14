/* eslint-disable max-lines */
import { Currency, ElixirVaultProvider } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { ElixirVaultState, useElixirVaultStateAtom } from './atom';
import { getElixirVaultDetailFromProviders, getElixirVaultsFromProviders } from './providers';
import {
  CurrencyField,
  ElixirVault,
  ElixirVaultDetail,
  GetElixirVaultDetailsProps,
  GetElixirVaultsProps,
  TransactionStatus,
} from './types';

export function useElixirVaultState(): ElixirVaultState {
  const { elixirVaultState } = useElixirVaultStateAtom();
  return elixirVaultState;
}

export function useElixirVaultActionHandlers(): {
  onCurrencySelection: (field: CurrencyField, currency: Currency) => void;
  onSwitchTokens: () => void;
  onCloseDetailModal: () => void;
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
    resetSelectedVaultDetails,
  } = useElixirVaultStateAtom();
  const { elixirVaults, elixirVaultsLoaderStatus } = useElixirVaultState();

  const onSelectElixirVault = (elixirVault: ElixirVault) => {
    const selectedElixirVaultIndex = elixirVaults.findIndex((r) => r === elixirVault);
    selectElixirVault({ selectedElixirVault: selectedElixirVaultIndex });
  };

  const onCloseDetailModal = useCallback(() => {
    resetSelectedVaultDetails();
  }, [resetSelectedVaultDetails]);

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
    onCloseDetailModal,
    onCurrencySelection,
    onSelectElixirVault,
    onUserInput,
    onChangeElixirVaultLoaderStatus,
    onClearTransactionData,
  };
}

export function useDerivedElixirVaultInfo(): {
  elixirVaults?: ElixirVault[];
  selectedVaultDetails?: ElixirVaultDetail;
  elixirVaultsLoaderStatus?: boolean;
} {
  const { elixirVaults, elixirVaultsLoaderStatus, selectedVaultDetails } = useElixirVaultState();

  return {
    elixirVaults,
    selectedVaultDetails,
    elixirVaultsLoaderStatus,
  };
}

export function useVaultActionHandlers(): {
  getVaults: (props: GetElixirVaultsProps) => void;
  getVaultDetails: (props: GetElixirVaultDetailsProps, vaultProvider: ElixirVaultProvider) => void;
} {
  const { setElixirVaults, setElixirVaultDetail } = useElixirVaultStateAtom();
  const getVaults = async (routesProps: GetElixirVaultsProps) => {
    const promises = Object.values(getElixirVaultsFromProviders).map((getVaults) => getVaults(routesProps));
    const elixirVaults = (await Promise.allSettled(promises)).flatMap((p) => (p.status === 'fulfilled' ? p.value : []));
    setElixirVaults({
      elixirVaults: elixirVaults.filter((x: ElixirVault | undefined) => !!x) as ElixirVault[],
      elixirVaultsLoaderStatus: false,
    });
  };

  const getVaultDetails = async (props: GetElixirVaultDetailsProps, vaultProvider: ElixirVaultProvider) => {
    const promise = getElixirVaultDetailFromProviders[vaultProvider.id](props);
    const res = await Promise.allSettled([promise]);
    const elixirVaultDetails = (
      res?.flatMap((p) => (p.status === 'fulfilled' ? p.value : [])) as ElixirVaultDetail[]
    )?.[0];
    setElixirVaultDetail({
      selectedVaultDetails: elixirVaultDetails,
    });
    return res;
  };

  return {
    getVaults,
    getVaultDetails,
  };
}
