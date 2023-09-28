import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export interface CoingeckoTokenData {
  id: string;
  symbol: string;
  name: string;
}

export interface CoingeckoWatchListToken extends CoingeckoTokenData {
  price: string | null;
  imageUrl: string | null;
  weeklyChartData: Array<{
    timestamp: string;
    priceUSD: number;
  }>;
}

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
