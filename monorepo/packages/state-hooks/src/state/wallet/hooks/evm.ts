/* eslint-disable max-lines */

import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { ERC20_INTERFACE, isAddress, useMulticallContract } from '@honeycomb/shared';
import { useMemo } from 'react';
import { useMultipleContractSingleData, useSingleContractMultipleData } from 'src/state/multicall/hooks';

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

export function useTokenBalances(
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

  const tokenBalances = useMemo(
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
  );
  return [tokenBalances, anyLoading];
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const [tokenBalances] = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

/* eslint-enable max-lines */
