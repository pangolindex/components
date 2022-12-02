import { ChainId } from '@pangolindex/sdk';
import { createAction } from '@reduxjs/toolkit';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum LimitField {
  INPUT = 'input',
  OUTPUT = 'output',
  PRICE = 'price',
}

export enum LimitNewField {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  PRICE = 'PRICE',
}

export interface FeeInfo {
  feePartner: number;
  feeProtocol: number;
  feeTotal: number;
  feeCut: number;
  initialized: boolean;
}

export const selectCurrency = createAction<{ field: Field; currencyId: string; chainId: ChainId }>(
  'pswap/selectCurrency',
);
export const switchCurrencies = createAction<{ chainId: ChainId }>('pswap/switchCurrencies');
export const typeInput = createAction<{ field: Field; typedValue: string; chainId: ChainId }>('pswap/typeInput');
export const replaceSwapState = createAction<{
  field: Field;
  typedValue: string;
  inputCurrencyId?: string;
  outputCurrencyId?: string;
  recipient: string | null;
  chainId: ChainId;
}>('pswap/replaceSwapState');
export const setRecipient = createAction<{ recipient: string | null; chainId: ChainId }>('pswap/setRecipient');
export const updateFeeTo = createAction<{ feeTo: string; chainId: ChainId }>('pswap/updateFeeTo');
export const updateFeeInfo = createAction<{ feeInfo: FeeInfo; chainId: ChainId }>('pswap/updateFeeInfo');
