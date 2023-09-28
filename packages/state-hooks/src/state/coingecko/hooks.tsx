/* eslint-disable max-lines */
import { useChainId } from '@honeycomb-finance/shared';
import { CHAINS, ChainId, Currency, Token } from '@pangolindex/sdk';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult, useQueries, useQuery } from 'react-query';
import { CoingeckoTokenData, CoingeckoWatchListState, CoingeckoWatchListToken, useCoingeckoWatchList } from './atom';
import { COINGECKO_CURRENCY_ID, COINGECKO_TOKENS_MAPPING, COINGEKO_BASE_URL } from './constants';

export interface CoingeckoData {
  coinId: string;
  homePage: string;
  description: string;
}

export interface MarketCoinsAPIResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
  sparkline_in_7d: {
    price: Array<number>;
  };
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
        if (!coin?.id) return;
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

/**
 * to fetch coingecko market data
 * @param page
 * @param ids
 * @returns coinmarket data
 */
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

/**
 * to make coingecko token data which is used in show token list
 * @param results
 * @returns CoingeckoWatchListState
 */
export const makeCoingeckoTokenData = (toknesData: MarketCoinsAPIResponse[]): CoingeckoWatchListState => {
  const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const apiTokens = (toknesData || []).reduce<{
    [id: string]: CoingeckoWatchListToken;
  }>((tokenMap: CoingeckoWatchListState, tokenData) => {
    if (tokenData) {
      const formattedHistory = [] as Array<{ timestamp: string; priceUSD: number }>;

      const priceData = tokenData?.sparkline_in_7d?.price || [];

      // for each hour, construct the open and close price
      for (let i = 0; i < priceData.length - 1; i++) {
        formattedHistory.push({
          timestamp: ((sevenDaysAgo.getTime() + 60 * 60) / 1000).toFixed(0),
          priceUSD: parseFloat(String(priceData[i] || 0)),
        });
      }

      tokenMap[tokenData?.id] = {
        id: tokenData?.id,
        name: tokenData?.name,
        symbol: tokenData?.symbol?.toUpperCase(),
        price: String(tokenData?.current_price || '-'),
        imageUrl: tokenData?.image,
        weeklyChartData: formattedHistory,
      };
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
  const { currencies, addCoingeckoTokens } = useCoingeckoWatchList();

  const queryParameter = [] as any;
  const totalPages = 8;
  for (let page = 1; page <= totalPages; page++) {
    queryParameter.push({
      queryKey: ['get-coingecko-token-data', page],
      queryFn: fetchCoinMarketData(page),
      staleTime: 1000 * 60 * 20, // 20 minutes
    });
  }

  const results = useQueries(queryParameter);

  const apiTokens = useMemo(() => {
    const toknesData = results.reduce((acc: MarketCoinsAPIResponse[], result) => {
      const data = result?.data as MarketCoinsAPIResponse[];

      if (data && result?.isLoading === false) {
        return acc.concat(data);
      }

      return acc;
    }, []);

    return makeCoingeckoTokenData(toknesData);
  }, [results]);

  useEffect(() => {
    addCoingeckoTokens(apiTokens);
  }, [Object.values(apiTokens || []).length]);

  return currencies;
}

/**
 * its use for search token based on text
 * @param coinText
 * @returns [id: string]: CoingeckoWatchListToken
 */
export function useCoinGeckoSearchTokens(coinText: string): {
  [id: string]: CoingeckoWatchListToken;
} {
  const { data: searchTokens, isLoading } = useQuery<Array<CoingeckoTokenData>>(
    ['coingeckoSearchTokens', coinText],
    async () => {
      if (coinText.length === 0) {
        return undefined;
      }
      const response: AxiosResponse = await coingeckoAPI.get(`search?query=${coinText}`);
      return response?.data?.coins || [];
    },
    {
      staleTime: 1000 * 60 * 20, // 20 minutes
      enabled: coinText.length > 0,
    },
  );

  const coinIds = ((!isLoading && searchTokens) || []).map((item) => item.id);
  const page = 1;

  const results: UseQueryResult = useQuery(
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

  return apiTokens;
}
/* eslint-enable max-lines */
