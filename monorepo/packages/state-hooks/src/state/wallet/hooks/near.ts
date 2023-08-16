/* eslint-disable max-lines */

import { ChainId, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useChainId } from '@pangolindex/shared';
import { nearFn } from '@pangolindex/wallet-connectors';
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';
// @ts-expect-error because this code we enable after connector package done
// TODO: when add connector package
import { near } from 'src/connectors';

/**
 * Returns a Near Wallet balance.
 */
export function useNearBalance(
  chainId: ChainId,
  accounts?: (string | undefined)[],
): { [address: string]: any } | undefined {
  const [nearBalance, setNearBalance] = useState<{ [address: string]: any }>();

  const nearToken = WAVAX[chainId];

  useEffect(() => {
    async function checkNearBalance() {
      const balance = await near.getAccountBalance();
      if (balance && accounts?.[0]) {
        const nearTokenBalance = new TokenAmount(nearToken, balance.available);

        const container = {} as { [address: string]: any | undefined };
        container[accounts?.[0]] = nearTokenBalance;

        setNearBalance(container);
      }
    }

    checkNearBalance();
  }, [accounts, chainId]);

  return useMemo(() => nearBalance, [nearBalance]);
}

const fetchNearTokenBalance = (token?: Token, account?: string) => async () => {
  if (token) {
    const balance = await nearFn.getTokenBalance(token?.address, account);

    return new TokenAmount(token, balance);
  }
  return undefined;
};

const fetchNearPoolShare = (chainId: number, pair: Pair) => async () => {
  if (pair) {
    const share = await nearFn.getSharesInPool(chainId, pair?.token0, pair?.token1);

    return new TokenAmount(pair?.liquidityToken, share);
  }
  return undefined;
};

export function useNearTokenBalances(
  address?: string,
  tokensOrPairs?: (Token | Pair | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const chainId = useChainId();

  const queryParameter = useMemo(() => {
    return (
      tokensOrPairs?.map((item) => {
        if (item instanceof Pair) {
          return {
            queryKey: ['pair-balance', item?.liquidityToken?.address, address],
            queryFn: fetchNearPoolShare(chainId, item),
          };
        }
        return {
          queryKey: ['token-balance', item?.address, address],
          queryFn: fetchNearTokenBalance(item, address),
        };
      }) ?? []
    );
  }, [tokensOrPairs]);

  const results = useQueries(queryParameter);

  const anyLoading = useMemo(() => results?.some((t) => t?.isLoading), [results]);
  const tokenBalances = useMemo(
    () =>
      results.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, result, i) => {
        const value = result?.data;
        const token = tokensOrPairs?.[i];

        if (token && token instanceof Token) {
          memo[token?.address] = value;
        } else if (token && token instanceof Pair) {
          memo[token?.liquidityToken?.address] = value;
        }
        return memo;
      }, {}),
    [tokensOrPairs, address, results],
  );

  return [tokenBalances, anyLoading];
}

// get the balance for a single token/account combo
export function useNearTokenBalance(account?: string, tokenOrPair?: Token | Pair): TokenAmount | undefined {
  const tokensOrPairs = useMemo(() => [tokenOrPair], [tokenOrPair]);
  const [tokenBalances] = useNearTokenBalances(account, tokensOrPairs);
  if (!tokenOrPair) return undefined;

  if (tokenOrPair && tokenOrPair instanceof Token) {
    return tokenBalances[tokenOrPair?.address];
  } else if (tokenOrPair && tokenOrPair instanceof Pair) {
    return tokenBalances[tokenOrPair?.liquidityToken?.address];
  }
}

/* eslint-enable max-lines */
