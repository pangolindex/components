import { AVALANCHE_MAINNET, CAVAX, ChainId, Currency, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import axios from 'axios';
import qs from 'qs';
import { useQuery } from 'react-query';
import { OPEN_API_DEBANK, ZERO_ADDRESS } from 'src/constants';
import { usePangolinWeb3 } from 'src/hooks';
import { getChainByNumber, isAddress } from 'src/utils';

const openApi = axios.create({
  baseURL: OPEN_API_DEBANK,
  timeout: 2000,
});

export interface Balances {
  total: number;
  chains: {
    [x: string]: number | undefined;
  };
}

export interface Protocol {
  id: string;
  name: string;
  url: string;
  logo: string;
}

export class TokenDataUser {
  token: Currency | Token;
  price: number;
  amount: number;
  usdValue: number;
  protocol?: Protocol;
  logo?: string;

  constructor(token: Token | Currency, price: number, amount: number, protocol?: Protocol, logo?: string) {
    this.token = token;
    this.price = price;
    this.amount = amount;
    this.usdValue = price * amount;
    this.protocol = protocol;
    this.logo = logo;
  }
}

export class PairDataUser {
  pair: Pair;
  usdValue: number;
  protocol?: Protocol;
  logos?: [string, string];

  constructor(pair: Pair, usdValue: number, protocol?: Protocol, logos?: [string, string]) {
    this.pair = pair;
    this.usdValue = usdValue;
    this.protocol = protocol;
    this.logos = logos;
  }
}

// Get the USD balance of address of all chains (supported by Debank)
export function useGetChainsBalances() {
  const { account } = usePangolinWeb3();
  const query = qs.stringify(
    {
      user_addr: account,
    },
    {
      encodeValuesOnly: true,
    },
  );

  return useQuery(
    ['getChainsBalances', account],
    async () => {
      if (account) {
        const response = await openApi.get(`/token/cache_balance_list?${query}`);
        const data: {
          amount: number;
          chain: string;
          price: number;
        }[] = response.data.data;

        const chains: { [x: string]: number | undefined } = {};
        let total = 0;
        data?.forEach((token) => {
          const usdBalance = token.price * token.amount;
          if (usdBalance >= 0.01) {
            total += usdBalance;
            const chainBalance = chains[token.chain] ?? 0;
            chains[token.chain] = chainBalance + usdBalance;
          }
        });

        return {
          total: total,
          chains: chains,
        } as Balances;
      }

      return null;
    },
    { refetchOnWindowFocus: false },
  );
}

// Get the Tokens of wallet
export function useGetWalletChainTokens(chainId: number) {
  const { account } = usePangolinWeb3();
  let chain = getChainByNumber(chainId);
  const getPangolinPairs = async () => {
    const query = qs.stringify(
      {
        user_addr: account,
        project_id: 'avax_pangolin',
      },
      {
        encodeValuesOnly: true,
      },
    );
    if (account) {
      try {
        const response = await openApi.get(`/portfolio/list?${query}`);
        const data = response.data.data;
        const requestPairs: (TokenDataUser | PairDataUser)[] = data?.portfolio_item_list.map((pair: any) => {
          const token1 = pair?.detail?.supply_token_list[0];
          const token2 = pair?.detail?.supply_token_list[1];
          // If token2 does not exist its because this pair is not a pair but a single staking
          if (!token2) {
            return new TokenDataUser(
              new Token(chainId, token1?.id, token1?.decimals, `${token1?.symbol} - Staked`, token1?.name),
              token1?.price,
              token1?.amount,
            );
          }

          const tokenA = new TokenAmount(
            new Token(chainId, token1?.id, token1?.decimals, token1?.symbol, token1?.name),
            token1?.amount.toString().replace('.', ''),
          );

          const tokenB = new TokenAmount(
            new Token(chainId, token2?.id, token2?.decimals, token2?.symbol, token2?.name),
            token2?.amount.toString().replace('.', ''),
          );

          return new PairDataUser(new Pair(tokenA, tokenB, chainId), pair?.stats?.net_usd_value, undefined, [
            token1?.logo_url,
            token2?.logo_url,
          ]);
        });
        return requestPairs;
      } catch (error) {
        return [];
      }
    }
    return [];
  };

  const getTokens = async () => {
    if (account) {
      if (!chain || !chain.mainnet) {
        chain = AVALANCHE_MAINNET;
      }

      const query = qs.stringify(
        {
          user_addr: account,
          is_all: false,
          chain: chain.symbol.toLowerCase(),
        },
        {
          encodeValuesOnly: true,
        },
      );

      try {
        const response = await openApi.get(`/token/cache_balance_list?${query}`);
        const data: {
          amount: number;
          price: number;
          is_verified: boolean;
          is_wallet: boolean;
          id: string;
          name: string;
          symbol: string;
          decimals: number;
          logo_url: string;
        }[] = response.data?.data;

        let requestTokens: (TokenDataUser | PairDataUser)[] = data
          .filter((token) => token?.is_wallet && token?.is_verified)
          .map((token) => {
            if (token?.id?.toLowerCase() === (CAVAX[chainId]?.symbol).toLowerCase()) {
              return new TokenDataUser(CAVAX[chainId], token?.price, token?.amount);
            }

            if (!isAddress(token?.id)) {
              return new TokenDataUser(
                new Token(chainId, ZERO_ADDRESS, token?.decimals, token?.symbol, token?.name),
                token?.price,
                token?.amount,
                undefined,
                token?.logo_url, // work around now for other coins of other chains
              );
            }

            return new TokenDataUser(
              new Token(chainId, token?.id, token?.decimals, token?.symbol, token?.name),
              token?.price,
              token?.amount,
              undefined,
              token?.logo_url,
            );
          });

        if (chainId === ChainId.AVALANCHE) {
          const pairs = await getPangolinPairs();
          requestTokens = [...requestTokens, ...pairs];
        }

        return requestTokens.sort((a, b) => b.usdValue - a.usdValue).filter((token) => token.usdValue >= 0.01);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  return useQuery(
    ['getWalletChainTokens', chainId.toString(), account],
    async () => {
      const tokens = await getTokens();
      return tokens;
    },
    {
      refetchInterval: 600000,
      refetchOnWindowFocus: false,
    },
  );
}
