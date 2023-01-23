import { createReducer } from '@reduxjs/toolkit';
import { CoingeckoWatchListToken } from 'src/state/pcoingecko/hooks';
import { addCurrency, removeCurrency, updateCurrencies } from './actions';

export interface WatchlistState {
  readonly selectedCurrencies: CoingeckoWatchListToken[];
}

const initialState: WatchlistState = {
  selectedCurrencies: [],
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addCurrency, (state, { payload: currency }) => {
      const existingSelectedListUrl = ([] as CoingeckoWatchListToken[]).concat(state.selectedCurrencies || []);

      existingSelectedListUrl.push(currency);
      state.selectedCurrencies = existingSelectedListUrl;
    })
    .addCase(removeCurrency, (state, { payload: id }) => {
      const existingList = ([] as CoingeckoWatchListToken[]).concat(state.selectedCurrencies || []);

      const index = existingList.findIndex((x) => x.id === id);

      if (index !== -1) {
        if (existingList?.length === 1) {
          // if user want to remove the list and if there is only one item in the selected list
          state.selectedCurrencies = [] as CoingeckoWatchListToken[];
        } else {
          existingList.splice(index, 1);
          state.selectedCurrencies = existingList;
        }
      }
    })
    .addCase(updateCurrencies, (state, { payload: data }) => {
      const res = data.reduce((acc: CoingeckoWatchListToken[], curr) => {
        const stored = state.selectedCurrencies.find(({ id }) => id === curr?.id);
        if (stored) {
          stored.price = curr?.price;
          stored.weeklyChartData = curr?.weeklyChartData;
          acc.push(stored);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      state.selectedCurrencies = res;
    }),
);
