import { parseBytes32String } from '@ethersproject/strings';
import { CAVAX, CHAINS, ChainId, Currency, Token } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { COINGEKO_BASE_URL } from 'src/constants';
import { useSelectedTokenList } from 'src/state/plists/hooks';
import { NEVER_RELOAD, useSingleCallResult } from 'src/state/pmulticall/hooks';
import { useUserAddedTokens } from 'src/state/puser/hooks';
import { isAddress } from 'src/utils';
import { nearFn } from 'src/utils/near';
import { useTokenHook } from './multiChainsHooks';
import { useBytes32TokenContract, useTokenContract } from './useContract';
import { useChainId } from './index';

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

export interface NearTokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
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

export function useNearToken(tokenAddress?: string): Token | undefined | null {
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

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const chainId = useChainId();
  const isAVAX = currencyId?.toUpperCase() === 'AVAX';
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

        const url = `${COINGEKO_BASE_URL}simple/token_price/${
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

        const url = `${COINGEKO_BASE_URL}coins/${
          chain.coingecko_id
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
