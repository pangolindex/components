import { createReducer } from '@reduxjs/toolkit';
import { CoingeckoWatchListToken } from 'src/state/pcoingecko/hooks';
import { addCurrency, removeCurrency } from './actions';

export interface WatchlistState {
  readonly currencies: CoingeckoWatchListToken[];
}

const initialState: WatchlistState = {
  currencies: [],
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addCurrency, (state, { payload: currency }) => {
      const existingSelectedListUrl = ([] as CoingeckoWatchListToken[]).concat(state.currencies || []);

      existingSelectedListUrl.push(currency);
      state.currencies = existingSelectedListUrl;
    })
    .addCase(removeCurrency, (state, { payload: id }) => {
      const existingList = ([] as CoingeckoWatchListToken[]).concat(state.currencies || []);

      const index = existingList.findIndex((x) => x.id === id);

      if (index !== -1) {
        if (existingList?.length === 1) {
          // if user want to remove the list and if there is only one item in the selected list
          state.currencies = [] as CoingeckoWatchListToken[];
        } else {
          existingList.splice(index, 1);
          state.currencies = existingList;
        }
      }
    }),
);
