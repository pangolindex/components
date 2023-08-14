import { CAVAX, ChainId, Currency, CurrencyAmount, Token, TokenAmount } from '@pangolindex/sdk';
import { useChainId, usePangolinWeb3 } from '@pangolindex/shared';
import { useMemo } from 'react';
import { useAllTokens } from 'src/hooks/useAllTokens';
import { useAccountBalanceHook, useTokenBalancesHook } from './index';

export function useCurrencyBalances(
  chainId: ChainId,
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies],
  );

  const useTokenBalances_ = useTokenBalancesHook[chainId];
  const useETHBalances_ = useAccountBalanceHook[chainId];

  const [tokenBalances] = useTokenBalances_(account, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => chainId && currency === CAVAX[chainId]) ?? false,
    [chainId, currencies],
  );

  const accountArr = useMemo(() => [account], [account]);
  const memoArr = useMemo(() => [], []);
  const ethBalance = useETHBalances_(chainId, containsETH ? accountArr : memoArr);

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined;
        if (currency instanceof Token) return tokenBalances[currency.address];
        if (currency === CAVAX[chainId]) return ethBalance?.[account];
        return undefined;
      }) ?? [],
    [chainId, account, currencies, ethBalance, tokenBalances],
  );
}

export function useCurrencyBalance(
  chainId: ChainId,
  account?: string,
  currency?: Currency,
): CurrencyAmount | undefined {
  const currencyArr = useMemo(() => [currency], [currency]);
  return useCurrencyBalances(chainId, account, currencyArr)[0];
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = usePangolinWeb3();

  const chainId = useChainId();

  const useTokenBalances_ = useTokenBalancesHook[chainId];

  const allTokens = useAllTokens();

  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens]);
  const [balances] = useTokenBalances_(account ?? undefined, allTokensArray);
  return balances ?? {};
}
