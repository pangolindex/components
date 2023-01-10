import { createAction } from '@reduxjs/toolkit';
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

export const selectChain = createAction<{ field: ChainField; chainId: string }>('pbridge/selectChain');
export const selectCurrency = createAction<{ field: CurrencyField; currencyId: string }>('pbridge/selectCurrency');

export const switchChains = createAction<void>('pbridge/switchChains');
export const switchCurrencies = createAction<void>('pbridge/switchCurrencies');

export const replaceBridgeState = createAction<{
  currencyField: CurrencyField;
  chainField: ChainField;
  inputCurrencyId?: string;
  outputCurrencyId?: string;
  fromChainId?: string;
  toChainId?: string;
  recipient: string | null;
  routes?: Route[];
  selectedRoute?: number;
  routesLoaderStatus?: boolean;
  transactionLoaderStatus?: boolean;
  transactionError?: Error;
  transactionStatus?: TransactionStatus;
}>('pbridge/replaceBridgeState');
export const setRecipient = createAction<{ recipient: string | null }>('pbridge/setRecipient');
export const typeAmount = createAction<{ field: CurrencyField; typedValue: string }>('pbridge/typeAmount');
export const setRoutes = createAction<{ routes: Route[]; routesLoaderStatus: boolean }>('pbridge/routes');
export const selectRoute = createAction<{ selectedRoute: number }>('pbridge/selectRoute');
export const changeRouteLoaderStatus = createAction<{ routesLoaderStatus: boolean }>('pbridge/changeRouteLoaderStatus');
export const changeTransactionLoaderStatus = createAction<{
  transactionLoaderStatus: boolean;
  transactionStatus?: TransactionStatus;
}>('pbridge/changeTransactionStatus');
export const setTransactionError = createAction<{ transactionError: Error }>('pbridge/setTransactionError');
export const clearTransactionData = createAction<void>('pbridge/clearTransactionData');
