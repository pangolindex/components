import { ALL_CHAINS, AVALANCHE_MAINNET, CAVAX, ChainId, Currency, Pair, Token, TokenAmount } from '@pangolindex/sdk';
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
    chainID: number;
    balance: number;
  }[];
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
      id: account,
    },
    {
      encodeValuesOnly: true,
    },
  );

  return useQuery(
    ['getChainsBalances', account],
    async () => {
      if (account) {
        const response = await openApi.get(`/total_balance?${query}`);
        const data = response.data;
        const chainbalances: Balances = {
          total: data?.total_usd_value,
          chains: [],
        };
        data?.chain_list?.forEach((chain: any) => {
          const _chain = ALL_CHAINS.filter((value) => value.chain_id === chain?.community_id)[0];
          if (_chain && chain?.usd_value >= 0.01) {
            chainbalances.chains.push({
              chainID: chain?.community_id,
              balance: chain?.usd_value,
            });
          }
        });
        chainbalances.chains.sort((a, b) => b.balance - a.balance);
        return chainbalances;
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
        id: account,
        protocol_id: 'avax_pangolin',
      },
      {
        encodeValuesOnly: true,
      },
    );
    if (account) {
      const response = await openApi.get(`/protocol?${query}`);
      const data = response.data;

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
          id: account,
          chain_id: chain.symbol.toLowerCase(),
        },
        {
          encodeValuesOnly: true,
        },
      );

      const response = await openApi.get(`/token_list?${query}`);
      const data = response.data;
      let requestTokens: (TokenDataUser | PairDataUser)[] = data
        .filter((token: any) => token?.is_wallet && token?.is_verified)
        .map((token: any) => {
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
