import { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  CoingeckoWatchListToken,
  fetchCoinMarketData,
  makeCoingeckoTokenData,
  useCoinGeckoTokens,
} from 'src/state/pcoingecko/hooks';
import { AppState, useDispatch, useSelector } from '../index';
import { updateCurrencies } from './actions';

export function useSelectedCurrencyLists(): CoingeckoWatchListToken[] | undefined {
  const dispatch = useDispatch();
  const allTokens = useCoinGeckoTokens();
  const coins = Object.values(allTokens || {});

  const allWatchlistCurrencies = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as CoingeckoWatchListToken[]).concat(state?.pwatchlists?.currencies || []),
  );

  const allCurrencies =
    allWatchlistCurrencies.length > 0
      ? allWatchlistCurrencies
      : coins?.[0]
      ? [coins?.[0], ...allWatchlistCurrencies]
      : ([] as CoingeckoWatchListToken[]);

  const coinIds = ((allWatchlistCurrencies as Array<CoingeckoWatchListToken>) || []).map((item) => {
    return item.id;
  });

  const page = 1;

  const results = useQuery(
    ['get-coingecko-token-data', page, coinIds.join(',')],
    async () => {
      const res = await fetchCoinMarketData(page, coinIds.join(','))();
      console.log('res', res);
      return res;
    },
    {
      enabled: coinIds?.length > 0,
    },
  );

  const apiTokens = useMemo(() => {
    return makeCoingeckoTokenData([results]);
  }, [results]);

  useEffect(() => {
    if (Object.values(apiTokens || []).length > 0) {
      dispatch(updateCurrencies(Object.values(apiTokens)));
    }
  }, [dispatch, Object.values(apiTokens || []).length]);

  return allCurrencies;
}

export function useIsSelectedCurrency(id: string): boolean {
  const allTokens = useCoinGeckoTokens();
  const coins = Object.values(allTokens || {});
  const allWatchlistCurrencies = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as CoingeckoWatchListToken[]).concat(state?.pwatchlists?.currencies || []),
  );

  const allCurrencies =
    allWatchlistCurrencies.length > 0
      ? allWatchlistCurrencies
      : coins?.[0]
      ? [coins?.[0], ...allWatchlistCurrencies]
      : ([] as CoingeckoWatchListToken[]);

  const index = allCurrencies.findIndex((x) => x?.id === id);

  return index !== -1 ? true : false;
}
