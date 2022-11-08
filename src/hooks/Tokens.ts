/* eslint-disable max-lines */
import { parseBytes32String } from '@ethersproject/strings';
import { CAVAX, CHAINS, ChainId, Currency, Token } from '@pangolindex/sdk';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from 'react-query';
import { COINGECKO_CURRENCY_ID, COINGEKO_BASE_URL } from 'src/constants';
import { COINGECKO_TOKENS_MAPPING } from 'src/constants/coingeckoTokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useSelectedTokenList } from 'src/state/plists/hooks';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from 'src/state/pmulticall/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useUserAddedTokens } from 'src/state/puser/hooks';
import { isAddress } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { NearTokenMetadata, nearFn } from 'src/utils/near';
import ERC20_INTERFACE, { ERC20_BYTES32_INTERFACE } from '../constants/abis/erc20';
import { useTokenHook } from './multiChainsHooks';
import { useBytes32TokenContract, useTokenContract } from './useContract';

export type TokenReturnType = Token | undefined | null;

export function useAllTokens(): { [address: string]: Token } {
  const chainId = useChainId();

  const userAddedTokens = useUserAddedTokens();
  const allTokens = useSelectedTokenList();
  return useMemo(() => {
    if (!chainId) return {};
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token;
            return tokenMap;
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId] },
        )
    );
  }, [chainId, userAddedTokens, allTokens]);
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): TokenReturnType {
  const chainId = useChainId();

  const tokens = useAllTokens();

  const address = isAddress(tokenAddress);

  const tokenContract = useTokenContract(address ? address : undefined, false);
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false);
  const token: Token | undefined = address ? tokens[address] : undefined;

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD);
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD);
  const symbolBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return undefined;
    if (decimals.loading || symbol.loading || tokenName.loading) return null;
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token'),
      );
    }
    return undefined;
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ]);
}

export function useNearToken(tokenAddress?: string): TokenReturnType {
  const [tokenData, setTokenData] = useState<NearTokenMetadata>();

  const chainId = useChainId();
  const tokens = useAllTokens();

  const address = tokenAddress;

  const token: Token | undefined = address ? tokens[address] : undefined;

  useEffect(() => {
    async function getTokenData() {
      if (address) {
        const tokenMetaData = await nearFn.getMetadata(address);

        setTokenData(tokenMetaData);
      }
    }

    getTokenData();
  }, [address]);

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return undefined;

    if (tokenData) {
      return new Token(chainId, address, tokenData?.decimals, tokenData?.symbol, tokenData?.name);
    }

    return undefined;
  }, [address, chainId, token, tokenData]);
}

export function useTokens(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const tokensName = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'name', undefined, NEVER_RELOAD);
  const tokensNameBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbols = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'symbol', undefined, NEVER_RELOAD);
  const symbolsBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!chainId) return [];

    return tokensAddress.reduce<Token[]>((acc, tokenAddress, index) => {
      const tokenName = tokensName?.[index];
      const tokenNameBytes32 = tokensNameBytes32?.[index];
      const symbol = symbols?.[index];
      const symbolBytes32 = symbolsBytes32?.[index];
      const decimal = decimals?.[index];
      const address = isAddress(tokenAddress);

      if (!!address && tokens[address]) {
        // if we have user tokens already
        acc.push(tokens[address]);
      } else if (
        tokenName?.loading === false &&
        tokenNameBytes32?.loading === false &&
        symbol?.loading === false &&
        symbolBytes32?.loading === false &&
        decimal?.loading === false &&
        address
      ) {
        const token = new Token(
          chainId,
          tokenAddress,
          decimal?.result?.[0],
          parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
          parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token'),
        );

        acc.push(token);
      }

      return acc;
    }, []);
  }, [chainId, decimals, symbols, symbolsBytes32, tokensName, tokensNameBytes32, tokens, tokensAddress]);
}

const fetchNearTokenMetadata = (address) => () => {
  return nearFn.getMetadata(address);
};

export function useNearTokens(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const queryParameter = useMemo(() => {
    return (
      tokensAddress?.map((address) => {
        return { queryKey: ['token', address], queryFn: fetchNearTokenMetadata(address) };
      }) ?? []
    );
  }, [tokensAddress]);

  const results = useQueries(queryParameter);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!chainId) return [];

    return results.reduce<Token[]>((acc, result) => {
      const tokenData = result?.data;

      if (tokenData && result?.isLoading === false) {
        if (!!tokenData?.id && tokens[tokenData?.id]) {
          // if we have user tokens already
          acc.push(tokens[tokenData?.id]);
        } else {
          const token = new Token(chainId, tokenData?.id, tokenData?.decimals, tokenData?.symbol, tokenData?.name);

          acc.push(token);
        }
      }

      return acc;
    }, []);
  }, [results, tokens]);
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const chainId = useChainId();
  const isAVAX = currencyId?.toUpperCase() === CAVAX[chainId].symbol?.toUpperCase();
  const useToken_ = useTokenHook[chainId];
  const token = useToken_(isAVAX ? undefined : currencyId);
  return isAVAX ? chainId && CAVAX[chainId] : token;
}

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

export function useCoinGeckoTokenPriceChart(coin: Token, days = '7') {
  const [result, setResult] = useState([] as Array<{ timestamp: string; priceUSD: number }>);

  useEffect(() => {
    const getCoinData = async () => {
      try {
        const chain = coin.chainId === 43113 ? CHAINS[ChainId.AVALANCHE] : CHAINS[coin.chainId];

        if (!chain) return null;

        const url = `${COINGEKO_BASE_URL}/coins/${
          chain?.coingecko_id
        }/contract/${coin.address.toLowerCase()}/market_chart/?vs_currency=usd&days=${days}`;

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

export interface CoingeckoData {
  coinId: string;
  homePage: string;
  description: string;
}

const coingeckoAPI = axios.create({
  baseURL: COINGEKO_BASE_URL,
  timeout: 5000, // 5 seconds
});
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

/* eslint-enable max-lines */
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

export function useHederaTokenAssociated(token: Token | undefined): {
  associate: undefined | (() => Promise<void>);
  isLoading: boolean;
  hederaAssociated: boolean;
} {
  const { account } = usePangolinWeb3();
  const addTransaction = useTransactionAdder();
  const chainId = useChainId();

  const tokenAddress = token?.address;

  const [loading, setLoading] = useState(false);

  const {
    isLoading,
    data: isAssociated = true,
    refetch,
  } = useQuery(['check-hedera-token-associated', tokenAddress, account], async () => {
    if (!tokenAddress || !account || chainId !== ChainId.HEDERA_TESTNET) return;

    const tokens = await hederaFn.getAccountAssociatedTokens(account);

    const currencyId = account ? hederaFn.hederaId(tokenAddress) : '';

    const token = (tokens || []).find((token) => token.tokenId === currencyId);

    return !!token;
  });

  return useMemo(() => {
    return {
      associate:
        account && tokenAddress
          ? async () => {
              try {
                setLoading(true);
                const txReceipt = await hederaFn.tokenAssociate(tokenAddress, account);
                if (txReceipt) {
                  setLoading(false);
                  refetch();

                  addTransaction(txReceipt, { summary: `${token?.symbol} successfully  associated` });
                }
              } catch (error) {
                setLoading(false);
                console.error('Could not deposit', error);
              }
            }
          : undefined,
      isLoading: loading,
      hederaAssociated: isAssociated,
    };
  }, [chainId, tokenAddress, account, loading, isLoading, isAssociated]);
}
