import { createReducer } from '@reduxjs/toolkit';
import { addCurrency, removeCurrency } from './actions';

export interface WatchlistState {
  readonly currencies: string[];
}

const initialState: WatchlistState = {
  currencies: [],
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addCurrency, (state, { payload: id }) => {
      const existingSelectedListUrl = ([] as string[]).concat(state.currencies || []);

      existingSelectedListUrl.push(id);
      state.currencies = existingSelectedListUrl;
    })
    .addCase(removeCurrency, (state, { payload: id }) => {
      const existingList = ([] as string[]).concat(state.currencies || []);
      const index = existingList.indexOf(id);

      if (index !== -1) {
        if (existingList?.length === 1) {
          // if user want to remove the list and if there is only one item in the selected list
          state.currencies = [] as string[];
        } else {
          existingList.splice(index, 1);
          state.currencies = existingList;
        }
      }
    }),
);
