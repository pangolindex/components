/* eslint-disable max-lines */
import { CHAINS, ChainId, Currency, Token } from '@pangolindex/sdk';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from 'react-query';
import { COINGECKO_CURRENCY_ID, COINGEKO_BASE_URL } from 'src/constants';
import { COINGECKO_TOKENS_MAPPING } from 'src/constants/coingeckoTokens';
import { useChainId } from 'src/hooks';
import { AppState, useDispatch, useSelector } from 'src/state';
import { addCoingeckoTokens } from './actions';
import { CoingeckoWatchListState } from './reducer';

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

export interface CoingeckoData {
  coinId: string;
  homePage: string;
  description: string;
}

const coingeckoAPI = axios.create({
  baseURL: COINGEKO_BASE_URL,
  timeout: 5000, // 5 seconds
});

export function useCoinGeckoTokenPrice(coin: Token) {
  const [result, setResult] = useState({} as { tokenUsdPrice: string });

  useEffect(() => {
    const getCoinPriceData = async () => {
      try {
        const chain = coin.chainId === 43113 ? CHAINS[ChainId.AVALANCHE] : CHAINS[coin.chainId];

        if (!chain) return null;

        const url = `${COINGEKO_BASE_URL}/simple/token_price/${
          chain.coingecko_id
        }?contract_addresses=${coin.address.toLowerCase()}&vs_currencies=usd`;
        const response = await fetch(url);
        const data = await response.json();

        setResult({
          tokenUsdPrice: data?.[coin.address.toLowerCase()]?.usd,
        });
      } catch (error) {
        console.error('coingecko api error', error);
      }
    };
    getCoinPriceData();
  }, [coin]);

  return result;
}

export function useCoinGeckoTokenPriceChart(coin: CoingeckoWatchListToken, days = '7') {
  const [result, setResult] = useState([] as Array<{ timestamp: string; priceUSD: number }>);

  useEffect(() => {
    const getCoinData = async () => {
      try {
        const url = `${COINGEKO_BASE_URL}/coins/${coin?.id}/market_chart/?vs_currency=usd&days=${days}`;

        const response = await fetch(url);
        const data = await response.json();

        const formattedHistory = [] as Array<{ timestamp: string; priceUSD: number }>;

        const priceData = data?.prices || [];

        // for each hour, construct the open and close price
        for (let i = 0; i < priceData.length - 1; i++) {
          formattedHistory.push({
            timestamp: (priceData[i]?.[0] / 1000).toFixed(0),
            priceUSD: parseFloat(priceData[i]?.[1]),
          });
        }

        setResult(formattedHistory);
      } catch (error) {
        console.error('coingecko api error', error);
      }
    };
    getCoinData();
  }, [coin, days]);

  return result;
}

/**
 *
 * @param token - Token to convert to another token if it exists in COINGECKO_TOKENS_MAPPING
 * @returns Original token or converted token if it exists in COINGECKO_TOKENS_MAPPING
 */
export function convertCoingeckoTokens(token: Token): Token {
  const chainId = token.chainId;
  const tokens: { [x: string]: Token | undefined } | undefined = COINGECKO_TOKENS_MAPPING[chainId];

  if (!tokens) {
    return token;
  }

  const _token = tokens[token.address];
  return _token ?? token;
}

/**
 * Get the coingecko data for a token
 * @param coin - Token or Currency
 * @returns CoingeckoData of token if exist in coingecko else null
 * */
export function useCoinGeckoTokenData(coin: Token | Currency) {
  const chainId = useChainId();
  const chain = CHAINS[chainId];

  const queryKey: (string | undefined)[] = ['coingeckoToken', chain.name];
  if (coin instanceof Token) {
    queryKey.push(coin.address);
  } else {
    queryKey.push(coin.name, coin.symbol);
  }

  return useQuery(
    queryKey,
    async () => {
      if (!chain.coingecko_id) {
        return undefined;
      }
      let response: AxiosResponse;

      if (coin instanceof Token) {
        response = await coingeckoAPI.get(`/coins/${chain.coingecko_id}/contract/${coin.address.toLowerCase()}`);
      } else {
        response = await coingeckoAPI.get(`/coins/${COINGECKO_CURRENCY_ID[chainId]}`);
      }

      const data = response.data;
      return {
        coinId: data?.id,
        homePage: data?.links?.homepage[0],
        description: data?.description?.en,
      } as CoingeckoData;
    },
    {
      cacheTime: Infinity,
      refetchInterval: false,
    },
  );
}

/**
 * Returns the gas coin price in usd of the chain
 * @param chainId the id of chain
 * @returns Returns the useQuery where data is a usd value in number of gas coin price
 */
export function useCoinGeckoCurrencyPrice(chainId: ChainId) {
  const currencyId = COINGECKO_CURRENCY_ID[chainId];

  return useQuery(
    ['coingeckoCurrencyPrice', chainId],
    async (): Promise<number> => {
      if (!currencyId) {
        return 0;
      }
      try {
        const response = await coingeckoAPI.get(`/simple/price?ids=${currencyId}&vs_currencies=usd`);
        const data = response.data;

        if (!data) return 0;

        return data[currencyId]?.usd ?? 0;
      } catch (error) {
        return 0;
      }
    },
    {
      cacheTime: 60 * 1000, // 1 minute
    },
  );
}
export const fetchCoinMarketData =
  (page: number, ids: string | undefined = '') =>
  async () => {
    try {
      const response: AxiosResponse = await coingeckoAPI.get(
        `coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=true&ids=${ids}`,
      );

      const data = response?.data;
      return data;
    } catch {
      return undefined;
    }
  };

export const makeCoingeckoTokenData = (results: any): CoingeckoWatchListState => {
  const toknesData = results.reduce((acc: any, result) => {
    const data = result?.data;

    if (data && result?.isLoading === false) {
      return acc.concat(data);
    }

    return acc;
  }, []);

  const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const apiTokens = ((toknesData as Array<any>) || []).reduce<{
    [id: string]: CoingeckoWatchListToken;
  }>((tokenMap: any, tokenData) => {
    if (tokenData) {
      const formattedHistory = [] as Array<{ timestamp: string; priceUSD: number }>;

      const priceData = tokenData?.sparkline_in_7d?.price || [];

      // for each hour, construct the open and close price
      for (let i = 0; i < priceData.length - 1; i++) {
        formattedHistory.push({
          timestamp: ((sevenDaysAgo.getTime() + 60 * 60) / 1000).toFixed(0),
          priceUSD: parseFloat(priceData[i]),
        });
      }

      tokenMap[tokenData?.id] = {
        id: tokenData?.id,
        name: tokenData?.name,
        symbol: tokenData?.symbol?.toUpperCase(),
        price: tokenData?.current_price,
        imageUrl: tokenData?.image,
        weeklyChartData: formattedHistory,
      };
      return tokenMap;
    }
    return tokenMap;
  }, {});

  return apiTokens;
};

/**
 * Get the coingecko all tokens
 * @returns CoingeckoData of token if exist in coingecko else null
 * */
export function useCoinGeckoTokens(): CoingeckoWatchListState {
  const dispatch = useDispatch();
  const tokens = useSelector<AppState['pcoingecko']>((state) => state.pcoingecko);

  const queryParameter = [] as any;
  const totalPages = 2;
  for (let page = 1; page <= totalPages; page++) {
    queryParameter.push({
      queryKey: ['get-coingecko-token-data', page],
      queryFn: fetchCoinMarketData(page),
    });
  }

  const results = useQueries(queryParameter);

  const apiTokens = useMemo(() => {
    return makeCoingeckoTokenData(results);
  }, [results]);

  useEffect(() => {
    dispatch(addCoingeckoTokens(apiTokens));
  }, [dispatch, Object.values(apiTokens || []).length]);

  return tokens?.currencies;
}

export function useCoinGeckoSearchTokens(coinText: string): {
  [id: string]: CoingeckoWatchListToken;
} {
  const { data: searchTokens, isLoading } = useQuery(
    ['coingeckoSearchTokens', coinText],
    async () => {
      const response: AxiosResponse = await coingeckoAPI.get(`search?query=${coinText}`);

      const data = response?.data?.coins;
      return data;
    },
    {
      refetchInterval: false,
    },
  );

  const coinIds = ((!isLoading && (searchTokens as Array<CoingeckoTokenData>)) || []).map((item) => {
    return item.id;
  });
  const page = 1;

  const results = useQuery(
    ['get-coingecko-token-data', page, coinIds.join(',')],
    async () => {
      const res = await fetchCoinMarketData(page, coinIds.join(','))();
      return res;
    },
    {
      enabled: coinIds?.length > 0,
    },
  );

  const apiTokens = useMemo(() => {
    return makeCoingeckoTokenData([results]);
  }, [results]);

  return apiTokens;
}
/* eslint-enable max-lines */
