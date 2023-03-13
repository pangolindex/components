import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  CoingeckoWatchListToken,
  MarketCoinsAPIResponse,
  fetchCoinMarketData,
  makeCoingeckoTokenData,
} from 'src/state/pcoingecko/hooks';

const localstorageKey = 'watchlist_pangolin';
const watchlistAtom = atomWithStorage<CoingeckoWatchListToken[]>(localstorageKey, []);

type useWatchlistType = [
  CoingeckoWatchListToken[],
  {
    addCurrency: (currency: CoingeckoWatchListToken) => void;
    removeCurrency: (id: string) => void;
    updateCurrencies: (data: CoingeckoWatchListToken[]) => void;
  },
];

export const useWatchlistAtom = () => {
  return useAtomValue(watchlistAtom);
};

export const useWatchlist = () => {
  const [selectedCurrencies, setSelectedCurrencies] = useAtom(watchlistAtom);

  const addCurrency = useCallback(
    (currency: CoingeckoWatchListToken) => {
      setSelectedCurrencies((prev) => [...prev, currency]);
    },
    [setSelectedCurrencies],
  );

  const removeCurrency = useCallback(
    (id: string) => {
      setSelectedCurrencies((prev) => prev.filter((currency) => currency.id !== id));
    },
    [setSelectedCurrencies],
  );

  const updateCurrencies = useCallback(
    (data: CoingeckoWatchListToken[]) => {
      setSelectedCurrencies((prev) =>
        data.map((currency) => {
          const prevCurrency = prev.find((prevCurrency) => prevCurrency.id === currency.id);

          if (prevCurrency) {
            return {
              ...prevCurrency,
              price: currency.price,
              weeklyChartData: currency.weeklyChartData,
            };
          } else {
            return currency;
          }
        }),
      );
    },
    [setSelectedCurrencies],
  );

  return [selectedCurrencies, { addCurrency, removeCurrency, updateCurrencies }] as useWatchlistType;
};

export function useSelectedCurrencyLists(): CoingeckoWatchListToken[] | undefined {
  const [, { updateCurrencies }] = useWatchlist();
  const allWatchlistCurrencies = useWatchlistAtom();

  const coinIds = (allWatchlistCurrencies || []).map((item) => {
    return item.id;
  });

  const page = 1;

  const results = useQuery(
    ['get-coingecko-token-data', page, coinIds.join(',')],
    fetchCoinMarketData(page, coinIds.join(',')),
    {
      enabled: coinIds?.length > 0,
    },
  );

  const apiTokens = useMemo(() => {
    const toknesData = results?.data as MarketCoinsAPIResponse[];
    return makeCoingeckoTokenData(toknesData);
  }, [results]);

  useEffect(() => {
    if (Object.values(apiTokens || []).length > 0) {
      updateCurrencies(Object.values(apiTokens));
    }
  }, [updateCurrencies, Object.values(apiTokens || []).length]);

  return allWatchlistCurrencies;
}
