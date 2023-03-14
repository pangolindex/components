import { createReducer } from '@reduxjs/toolkit';
import { Field, resetMintState, typeInput } from './actions1';

export interface MintState {
  [x: string]: {
    // the key is the pair address or contract address
    readonly independentField: Field;
    readonly typedValue: string;
    readonly otherTypedValue: string; // for the case when there's no liquidity
  };
}

export const initialKeyState = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  otherTypedValue: '',
};

const initialState: MintState = {};

export default createReducer<MintState>(initialState, (builder) =>
  builder
    .addCase(resetMintState, (state, { payload: { pairAddress } }) => {
      state[pairAddress] = initialKeyState;
      return state;
    })
    .addCase(typeInput, (state, { payload: { pairAddress, field, typedValue, noLiquidity } }) => {
      const pairState = state[pairAddress] ? { ...state[pairAddress] } : initialKeyState;
      if (noLiquidity) {
        if (field === pairState.independentField) {
          state[pairAddress] = {
            ...pairState,
            independentField: field,
            typedValue,
          };
          return state;
        }
        // they're typing into a new field, store the other value
        else {
          state[pairAddress] = {
            ...pairState,
            independentField: field,
            typedValue,
            otherTypedValue: pairState.typedValue,
          };
          return state;
        }
      } else {
        state[pairAddress] = {
          ...pairState,
          independentField: field,
          typedValue,
          otherTypedValue: '',
        };
        return state;
      }
    }),
);
