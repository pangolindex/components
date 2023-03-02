import { createReducer } from '@reduxjs/toolkit';
import { Field, resetBurnState, typeInput } from './actions';

export interface BurnState {
  [x: string]: {
    readonly independentField: Field;
    readonly typedValue: string;
  };
  [x: string]: {
    readonly independentField: Field;
    readonly typedValue: string;
  };
}

export const initialKeyState = {
  independentField: Field.CURRENCY_A,
export const initialKeyState = {
  independentField: Field.CURRENCY_A,
  typedValue: '0',
};

const initialState: BurnState = {};

const initialState: BurnState = {};

export default createReducer<BurnState>(initialState, (builder) =>
  builder
    .addCase(typeInput, (state, { payload: { pairAddress, field, typedValue } }) => {
      const pairState = state[pairAddress] ? { ...state[pairAddress] } : initialKeyState;
      state[pairAddress] = {
        ...pairState,
        independentField: field,
        typedValue,
      };
      return state;
    })
    .addCase(resetBurnState, (state, { payload: { pairAddress } }) => {
      state[pairAddress] = initialKeyState;
      return state;
    }),
);
