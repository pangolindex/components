import { createAction } from '@reduxjs/toolkit';
import { CoingeckoWatchListState } from './reducer';

export const addCoingeckoTokens = createAction<CoingeckoWatchListState>('pcoingecko/addCoingeckoTokens');
