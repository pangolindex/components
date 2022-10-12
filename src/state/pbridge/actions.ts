import { createAction } from '@reduxjs/toolkit';

export enum ChainField {
  FROM = 'FROM',
  TO = 'TO',
}

export enum CurrencyField {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
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
}>('pbridge/replaceBridgeState');
export const setRecipient = createAction<{ recipient: string | null }>('pbridge/setRecipient');
export const typeAmount = createAction<{ field: CurrencyField; typedValue: string }>('pbridge/typeAmount');
