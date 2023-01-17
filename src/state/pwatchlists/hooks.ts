import { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  CoingeckoWatchListToken,
  MarketCoinsAPIResponse,
  fetchCoinMarketData,
  makeCoingeckoTokenData,
} from 'src/state/pcoingecko/hooks';
import { AppState, useDispatch, useSelector } from '../index';
import { updateCurrencies } from './actions';

export function useSelectedCurrencyLists(): CoingeckoWatchListToken[] | undefined {
  const dispatch = useDispatch();

  const allWatchlistCurrencies = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as CoingeckoWatchListToken[]).concat(state?.pwatchlists?.currencies || []),
  );

  const coinIds = ((allWatchlistCurrencies as Array<CoingeckoWatchListToken>) || []).map((item) => {
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
      dispatch(updateCurrencies(Object.values(apiTokens)));
    }
  }, [dispatch, Object.values(apiTokens || []).length]);

  return allWatchlistCurrencies;
}
