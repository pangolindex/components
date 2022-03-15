import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from '../../constants';
import { createReducer } from '@reduxjs/toolkit';
import {
  updateUserSlippageTolerance,
  SerializedToken,
  updateUserExpertMode,
  addSerializedToken,
  removeSerializedToken,
} from './actions';

const currentTimestamp = () => new Date().getTime();

export interface UserState {
  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number;
  timestamp: number;
  userExpertMode: boolean;
  // deadline set by user in minutes, used in all txns
  userDeadline: number;
  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken;
    };
  };
}

export const initialState: UserState = {
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  tokens: {},
  timestamp: currentTimestamp(),
  userExpertMode: false,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance;
      state.timestamp = currentTimestamp();
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode;
      state.timestamp = currentTimestamp();
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {};
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken;
      state.timestamp = currentTimestamp();
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      state.tokens[chainId] = state.tokens[chainId] || {};
      delete state.tokens[chainId][address];
      state.timestamp = currentTimestamp();
    }),
);
