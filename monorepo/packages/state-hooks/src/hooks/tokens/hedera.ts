import { Token } from '@pangolindex/sdk';
import { useChainId, usePangolinWeb3 } from '@pangolindex/shared';
import { Hedera, hederaFn } from '@pangolindex/wallet-connectors';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTransactionAdder } from 'src/state/transactions/hooks';

/**
 * to get all hedera associated tokens
 * @params dependancies on which use query should refetch data
 * @returns all associated tokens
 */
export function useGetAllHederaAssociatedTokens(dependancies = [] as any[]) {
  const chainId = useChainId();

  const { account } = usePangolinWeb3();

  const response = useQuery(
    ['check-hedera-token-associated', account, ...dependancies],
    async () => {
      if (!account || !Hedera.isHederaChain(chainId)) return;
      const tokens = await hederaFn.getAccountAssociatedTokens(account);
      return tokens;
    },
    {
      keepPreviousData: true,
      refetchInterval: 1000 * 60, // 1 minute
      enabled: Hedera.isHederaChain(chainId), // only fetch if the chain id is hedera
    },
  );

  return response;
}

/**
 * this hook is useful to get token is associated or not and method to make that token associated
 * @param address
 * @param symbol
 * @returns  associate function, isLoading, hederaAssociated
 */
export function useHederaTokenAssociated(
  address: string | undefined,
  symbol: string | undefined,
): {
  associate: undefined | (() => Promise<void>);
  isLoading: boolean;
  hederaAssociated: boolean;
} {
  const { account } = usePangolinWeb3();
  const addTransaction = useTransactionAdder();
  const chainId = useChainId();

  const [loading, setLoading] = useState(false);

  const { data: tokens, isLoading, refetch } = useGetAllHederaAssociatedTokens();

  const currencyId = address ? hederaFn.hederaId(address) : '';

  let isAssociated = true; // if its not hedera chain then by default its true
  if (Hedera.isHederaChain(chainId)) {
    isAssociated = !!(tokens || []).find((token) => token.tokenId === currencyId);
  }

  return useMemo(() => {
    return {
      associate:
        account && address
          ? async () => {
              try {
                setLoading(true);
                const txReceipt = await hederaFn.tokenAssociate(address, account);
                if (txReceipt) {
                  refetch();
                  addTransaction(txReceipt, { summary: `${symbol} successfully  associated` });
                }
                setLoading(false);
              } catch (error) {
                setLoading(false);
                console.error('Could not deposit', error);
              }
            }
          : undefined,
      isLoading: loading,
      hederaAssociated: isAssociated,
    };
  }, [chainId, address, symbol, account, loading, isLoading, isAssociated]);
}

/**
 * this hook is useful to filter filter tokens which is not associated
 * @param tokens
 * @returns not associated tokens array
 */
export function useGetHederaTokenNotAssociated(tokens: Array<Token> | undefined): Array<Token> {
  const { account } = usePangolinWeb3();

  const { data, isLoading } = useGetAllHederaAssociatedTokens();

  return useMemo(() => {
    if (!tokens) {
      return [];
    }

    return tokens.reduce<Array<Token>>((memo, token) => {
      if (token?.address) {
        const currencyId = account ? hederaFn.hederaId(token?.address) : '';

        const isAssociated = (data || []).find((item) => item.tokenId === currencyId);

        if (!isAssociated) {
          memo.push(token);
        }
      }

      return memo;
    }, []);
  }, [data, isLoading, tokens]);
}
