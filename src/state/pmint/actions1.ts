import { createAction } from '@reduxjs/toolkit';

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export const typeInput =
  createAction<{ pairAddress: string; field: Field; typedValue: string; noLiquidity: boolean }>('mint/typeInputMint');
export const resetMintState = createAction<{ pairAddress: string }>('mint/resetMintState');
