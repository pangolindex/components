/* eslint-disable max-lines */
import { ChainId, JSBI, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { isAddress } from '@pangolindex/shared';
import { HederaTokenMetadata, hederaFn } from '@pangolindex/wallet-connectors';
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';
import { useGetAllHederaAssociatedTokens } from 'src/hooks/tokens/hedera';
import { useBlockNumber } from 'src/state/application/hooks';

export const fetchHederaPGLToken = (pairToken: Token | undefined, chainId: ChainId) => async () => {
  try {
    if (!pairToken) {
      return undefined;
    }

    const tokenAddress = pairToken ? pairToken?.address : '';
    // get pair contract id using api call because `asAccountString` is not working for pair address
    const { contractId } = await hederaFn.getContractData(tokenAddress);
    // get pair tokenId from pair contract id
    const tokenId = hederaFn.contractToTokenId(contractId?.toString());
    // convert token id to evm address
    const newTokenAddress = hederaFn.idToAddress(tokenId);
    const token = new Token(chainId, newTokenAddress, pairToken?.decimals, pairToken?.symbol, pairToken?.name);
    return token;
  } catch {
    return undefined;
  }
};

export function fetchHederaTokenMetaData(tokenAddress: string | undefined) {
  async function fetch() {
    try {
      if (!tokenAddress) {
        return undefined;
      }

      const result = await hederaFn.getMetadata(tokenAddress.toLowerCase());

      return result;
    } catch {
      return undefined;
    }
  }
  return fetch;
}

/**
 * This hook get all hedera token metadata from rest api
 * @param addresses address array of tokens to be queried
 * @returns object with key is the address and the value is the metadata
 */
export function useHederaTokensMetaData(addresses: (string | undefined)[]) {
  const queries = useMemo(() => {
    return addresses.map((address) => ({
      queryKey: ['get-hedera-token-metadata', address, hederaFn.HEDERA_API_BASE_URL],
      queryFn: fetchHederaTokenMetaData(address),
    }));
  }, [addresses]);

  const results = useQueries(queries);

  return useMemo(() => {
    const result: { [x: string]: HederaTokenMetadata | undefined } = {};
    addresses.forEach((address, index) => {
      if (address) {
        result[address] = results[index].data;
      }
    });
    return result;
  }, [results]);
}

/**
 * Returns a Hedera Wallet balance.
 */
export function useHederaBalance(
  chainId: ChainId,
  accounts?: (string | undefined)[],
): { [address: string]: TokenAmount | undefined } | undefined {
  const [hederaBalance, setHederaBalance] = useState<{ [address: string]: TokenAmount | undefined }>();

  const hederaToken = WAVAX[chainId];

  useEffect(() => {
    async function checkHederaBalance() {
      if (accounts?.[0]) {
        const balance = await hederaFn.getAccountBalance(accounts?.[0]);

        const hederaTokenBalance = new TokenAmount(hederaToken, balance);

        const container = {} as { [address: string]: TokenAmount | undefined };
        container[accounts?.[0]] = hederaTokenBalance;

        setHederaBalance(container);
      }
    }

    checkHederaBalance();
  }, [accounts, chainId]);

  return useMemo(() => hederaBalance, [hederaBalance]);
}

export function useHederaTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const latestBlockNumber = useBlockNumber();

  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const { data, isLoading } = useGetAllHederaAssociatedTokens([latestBlockNumber]);

  const balances = useMemo(() => {
    return (data || []).reduce<{ [tokenAddress: string]: string }>((memo, token) => {
      const address = hederaFn.idToAddress(token?.tokenId);

      if (address) {
        memo[address] = token.balance;
      }
      return memo;
    }, {});
  }, [data]);

  const tokenBalances = useMemo(
    () =>
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token) => {
            const value = token?.address ? balances[token.address] : 0;
            const amount = value ? JSBI.BigInt(value.toString()) : JSBI.BigInt(0);
            memo[token.address] = new TokenAmount(token, amount);
            return memo;
          }, {})
        : {},
    [address, validatedTokens, balances],
  );

  return [tokenBalances, isLoading];
}

export function useHederaTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const [tokenBalances] = useHederaTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}
/* eslint-enable max-lines */
