import { GELATO_PERSISTED_KEYS, gelatoReducers } from '@gelatonetwork/limit-orders-react';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import { load, save } from 'redux-localstorage-simple';

/**
 * create separate galeto store
 */
export const galetoStore = configureStore({
  reducer: gelatoReducers,
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: GELATO_PERSISTED_KEYS })],
  preloadedState: load({ states: GELATO_PERSISTED_KEYS }),
});
