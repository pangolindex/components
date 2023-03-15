import { GELATO_PERSISTED_KEYS, gelatoReducers } from '@gelatonetwork/limit-orders-react';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import { load, save } from 'redux-localstorage-simple';
import pbridge from './pbridge/reducer';
import plists from './plists/reducer';
import pmulticall from './pmulticall/reducer';
import pstake from './pstake/reducer';
import pswap from './pswap/reducer';
import puser from './puser/reducer';

export const PANGOLIN_PERSISTED_KEYS: string[] = ['puser', 'plists', 'pstake'];

export const pangolinReducers = {
  pswap,
  plists,
  pmulticall,
  puser,
  pstake,
  pbridge,
};

const store = configureStore({
  reducer: pangolinReducers,
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PANGOLIN_PERSISTED_KEYS })],
  preloadedState: load({ states: PANGOLIN_PERSISTED_KEYS }),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const StoreContext = React.createContext(null as any);

// Export your custom hooks if you wish to use them in other files.
export const useStore = createStoreHook(StoreContext);
export const useDispatch = createDispatchHook(StoreContext) as () => AppDispatch;
export const useSelector = createSelectorHook(StoreContext);

export default store;

/**
 * create separate galeto store
 */
export const galetoStore = configureStore({
  reducer: gelatoReducers,
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: GELATO_PERSISTED_KEYS })],
  preloadedState: load({ states: GELATO_PERSISTED_KEYS }),
});
