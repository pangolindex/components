import { createReducer } from '@reduxjs/toolkit';
import { addBridgeTransfer } from './actions';
import { BridgeTransfer } from './types';

export interface BridgeTransferState {
  readonly transfers: BridgeTransfer[];
}

const initialState: BridgeTransferState = {
  transfers: [],
};

export default createReducer<BridgeTransferState>(initialState, (builder) =>
  builder.addCase(addBridgeTransfer, (state, { payload: { transfer } }) => {
    return {
      ...state,
      transfers: [...state.transfers, transfer],
    };
  }),
);
