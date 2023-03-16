import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { CoingeckoWatchListToken } from './hooks';

export interface CoingeckoWatchListState {
  [id: string]: CoingeckoWatchListToken;
}

export const coingeckoWatchListAtom = atom({} as CoingeckoWatchListState);

export const useCoingeckoWatchList = () => {
  const [currencies, setCurrencies] = useAtom(coingeckoWatchListAtom);

  const addCoingeckoTokens = useCallback(
    (payload: CoingeckoWatchListState) => {
      setCurrencies(payload);
    },
    [setCurrencies],
  );

  return { currencies, addCoingeckoTokens };
};
