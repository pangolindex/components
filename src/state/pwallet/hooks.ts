import { CAVAX, ChainId, Currency, CurrencyAmount, JSBI, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';
import { near } from 'src/connectors';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { useMulticallContract } from 'src/hooks/useContract';
import { nearFn } from 'src/utils/near';
import { isAddress } from '../../utils';
import { useMultipleContractSingleData, useSingleContractMultipleData } from '../pmulticall/hooks';
import { useAccountBalanceHook, useTokenBalancesHook } from './multiChainsHooks';

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
  chainId: ChainId,
  uncheckedAddresses?: (string | undefined)[],
): { [address: string]: CurrencyAmount | undefined } {
  const multicallContract = useMulticallContract();

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses],
  );

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address]),
  );

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0];
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()), chainId);
        return memo;
      }, {}),
    [chainId, addresses, results],
  );
}

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

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens]);

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address]);

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances]);

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0];
              const amount = value ? JSBI.BigInt(value.toString()) : undefined;
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount);
              }
              return memo;
            }, {})
          : {},
      [address, validatedTokens, balances],
    ),
    anyLoading,
  ];
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0];
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

export function useNearTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  const queryParameter =
    tokens?.map((token) => {
      return { queryKey: [token?.address, address], queryFn: fetchNearTokenBalance(token, address) };
    }) ?? [];

  const results = useQueries(queryParameter);

  return useMemo(
    () =>
      results.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, result, i) => {
        const value = result?.data;
        const token = tokens?.[i];

        if (token) {
          memo[token?.address] = value;
        }
        return memo;
      }, {}),
    [tokens, address, results],
  );
}

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

  const tokenBalances = useTokenBalances_(account, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => chainId && currency === CAVAX[chainId]) ?? false,
    [chainId, currencies],
  );
  const ethBalance = useETHBalances_(chainId, containsETH ? [account] : []);

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
  return useCurrencyBalances(chainId, account, [currency])[0];
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = usePangolinWeb3();

  const chainId = useChainId();

  const useTokenBalances_ = useTokenBalancesHook[chainId];

  const allTokens = useAllTokens();

  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens]);
  const balances = useTokenBalances_(account ?? undefined, allTokensArray);
  return balances ?? {};
}
