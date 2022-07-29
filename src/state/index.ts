import { GELATO_PERSISTED_KEYS, gelatoReducers } from '@gelatonetwork/limit-orders-react';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import { load, save } from 'redux-localstorage-simple';
import papplication from './papplication/reducer';
import pburn from './pburn/reducer';
import plists from './plists/reducer';
import pmint from './pmint/reducer';
import pmulticall from './pmulticall/reducer';
import pstake from './pstake/reducer';
import pswap from './pswap/reducer';
import ptoken from './ptoken/reducer';
import ptransactions from './ptransactions/reducer';
import puser from './puser/reducer';
import pwatchlists from './pwatchlists/reducer';

export const PANGOLIN_PERSISTED_KEYS: string[] = [
  'puser',
  'plists',
  'ptransactions',
  'pwatchlists',
  'ptoken',
  'pstake',
];

export const pangolinReducers = {
  papplication,
  ptransactions,
  pswap,
  plists,
  pmulticall,
  puser,
  pwatchlists,
  ptoken,
  pstake,
  pmint,
  pburn,
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
