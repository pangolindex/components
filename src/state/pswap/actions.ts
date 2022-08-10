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

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('pswap/selectCurrency');
export const switchCurrencies = createAction<void>('pswap/switchCurrencies');
export const typeInput = createAction<{ field: Field; typedValue: string }>('pswap/typeInput');
export const replaceSwapState = createAction<{
  field: Field;
  typedValue: string;
  inputCurrencyId?: string;
  outputCurrencyId?: string;
  recipient: string | null;
}>('pswap/replaceSwapState');
export const setRecipient = createAction<{ recipient: string | null }>('pswap/setRecipient');
export const updateFeeTo = createAction<{ feeTo: string }>('pswap/updateFeeTo');
export const updateFeeInfo = createAction<{ feeInfo: FeeInfo }>('pswap/updateFeeInfo');
