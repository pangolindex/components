import { createAction } from '@reduxjs/toolkit';

export interface SerializedToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface SerializedPair {
  token0: SerializedToken;
  token1: SerializedToken;
}

export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number }>(
  'puser/updateUserSlippageTolerance',
);

export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('puser/updateUserExpertMode');
export const updateUserDeadline = createAction<{ userDeadline: string }>('puser/updateUserDeadline');

export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('puser/addSerializedToken');
export const removeSerializedToken = createAction<{ chainId: number; address: string }>('puser/removeSerializedToken');

export const addSerializedPair = createAction<{ serializedPair: SerializedPair }>('puser/addSerializedPair');
