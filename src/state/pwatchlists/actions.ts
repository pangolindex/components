import { createAction } from '@reduxjs/toolkit';
import { CoingeckoWatchListToken } from 'src/state/pcoingecko/hooks';

export const addCurrency = createAction<CoingeckoWatchListToken>('watchlists/addCurrency');
export const removeCurrency = createAction<string>('watchlists/removeCurrency');
