import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from '../../constants';
import {
  SerializedPair,
  SerializedToken,
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSlippageTolerance,
} from './actions';

const currentTimestamp = () => new Date().getTime();

export interface UserState {
  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number;
  timestamp: number;
  userExpertMode: boolean;
  // deadline set by user in minutes, used in all txns
  userDeadline: string;
  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken;
    };
  };
  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair;
    };
  };
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`;
}

export const initialState: UserState = {
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  tokens: {},
  timestamp: currentTimestamp(),
  userExpertMode: false,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  pairs: {},
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
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline;
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
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        state.pairs = state.pairs || {};
        const chainId = serializedPair.token0.chainId;
        state.pairs[chainId] = state.pairs[chainId] || {};
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair;
      }
      state.timestamp = currentTimestamp();
    }),
);
