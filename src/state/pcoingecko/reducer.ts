import { createReducer } from '@reduxjs/toolkit';
import { addCoingeckoTokens } from './actions';
import { CoingeckoWatchListToken } from './hooks';

export interface CoingeckoWatchListState {
  [id: string]: CoingeckoWatchListToken;
}

export const initialState = {
  currencies: {} as CoingeckoWatchListState,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(addCoingeckoTokens, (state, { payload }) => {
    state.currencies = payload;
  }),
);
