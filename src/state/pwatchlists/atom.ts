import { useAtomValue, useSetAtom } from 'jotai';
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

export const useWatchlistAtom = () => {
  return useAtomValue(watchlistAtom);
};

export const useAddCurrencyToWatchlist = () => {
  const setCurrencies = useSetAtom(watchlistAtom);

  const addCurrency = useCallback(
    (currency: CoingeckoWatchListToken) => {
      setCurrencies((prev) => [...prev, currency]);
    },
    [setCurrencies],
  );

  return addCurrency;
};

export const useRemoveCurrencyFromWatchlist = () => {
  const setCurrencies = useSetAtom(watchlistAtom);

  const removeCurrency = useCallback(
    (id: string) => {
      setCurrencies((prev) => prev.filter((currency) => currency.id !== id));
    },
    [setCurrencies],
  );

  return removeCurrency;
};

export const useUpdateWatchlistCurrencies = () => {
  const setCurrencies = useSetAtom(watchlistAtom);

  const removeCurrency = useCallback(
    (data: CoingeckoWatchListToken[]) => {
      setCurrencies((prev) =>
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
    [setCurrencies],
  );

  return removeCurrency;
};

export function useSelectedCurrencyLists(): CoingeckoWatchListToken[] | undefined {
  const updateCurrencies = useUpdateWatchlistCurrencies();
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

/**
 * another way to handle above code

 const watchlistAtom = atom<CoingeckoWatchListToken[]>([]);

  export const useWatchlist = () => {
    const [selectedCurrencies, setSelectedCurrencies] = useAtom(watchlistAtom);

    const addCurrency = (currency: CoingeckoWatchListToken) => {
      setSelectedCurrencies((prevSelectedCurrencies) => [
        ...prevSelectedCurrencies,
        currency,
      ]);
    };

    const removeCurrency = (id: string) => {
      setSelectedCurrencies((prevSelectedCurrencies) =>
        prevSelectedCurrencies.filter((currency) => currency.id !== id)
      );
    };

    const updateCurrencies = (data: CoingeckoWatchListToken[]) => {
      setSelectedCurrencies((prevSelectedCurrencies) =>
        data.map((currency) => {
          const prevCurrency = prevSelectedCurrencies.find(
            (prevCurrency) => prevCurrency.id === currency.id
          );

          if (prevCurrency) {
            return {
              ...prevCurrency,
              price: currency.price,
              weeklyChartData: currency.weeklyChartData,
            };
          } else {
            return currency;
          }
        })
      );
    };

    return [selectedCurrencies, { addCurrency, removeCurrency, updateCurrencies }];
  };
 */
