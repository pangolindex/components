import { GELATO_PERSISTED_KEYS, gelatoReducers } from '@gelatonetwork/limit-orders-react';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { load, save } from 'redux-localstorage-simple';
import papplication from './papplication/reducer';
import plists from './plists/reducer';
import pmulticall from './pmulticall/reducer';
import pswap from './pswap/reducer';
import ptransactions from './ptransactions/reducer';
import puser from './puser/reducer';

export const PANGOLIN_PERSISTED_KEYS: string[] = ['puser', 'plists', 'ptransactions', ...GELATO_PERSISTED_KEYS];

export const pangolinReducers = {
  papplication,
  ptransactions,
  pswap,
  plists,
  pmulticall,
  puser,
  ...gelatoReducers,
};

const store = configureStore({
  reducer: pangolinReducers,
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PANGOLIN_PERSISTED_KEYS })],
  preloadedState: load({ states: PANGOLIN_PERSISTED_KEYS }),
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
