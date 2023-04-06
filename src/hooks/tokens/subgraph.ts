import { Token } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useSubgraphTokens } from 'src/apollo/tokens';
import { useChainId } from 'src/hooks';
import { useShouldUseSubgraph } from 'src/state/papplication/hooks';
import { validateAddressMapping } from 'src/utils';
import { useAllTokens } from '../useAllTokens';
import { TokenReturnType } from './constant';
import { useTokens } from './evm';
/**
 * This hook format the tokens address to token object from sdk
 * @param tokensAddress token address array
 * @returns array of token object from sdk for valid tokens, null or undefined for invalid
 */
export function useTokensViaSubGraph(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const isAddressFn = validateAddressMapping[chainId];
  const { data: subgraphTokens, isLoading } = useSubgraphTokens(tokensAddress);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!subgraphTokens || isLoading) return [];

    return tokensAddress.reduce<TokenReturnType[]>((acc, tokenAddress) => {
      const tokenInfo = subgraphTokens?.find((subgraphToken) => tokenAddress === subgraphToken.id);
      const address = isAddressFn(tokenAddress);

      if (!!address && tokens[address]) {
        // if we have user tokens already
        acc.push(tokens[address]);
      } else if (tokenInfo && address) {
        try {
          const decimal = Number(tokenInfo.decimals);
          const token = new Token(chainId, address, decimal, tokenInfo.symbol, tokenInfo.name);
          acc.push(token);
        } catch {
          acc.push(null);
        }
      } else {
        acc.push(undefined);
      }

      return acc;
    }, []);
  }, [chainId, isLoading, subgraphTokens, tokens, tokensAddress]);
}

/**
 * its wrapper hook to check which hook need to use based on subgraph on off
 * @param tokensAddress
 * @returns
 */
export const useHederaTokens = (tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null => {
  const shouldUseSubgraph = useShouldUseSubgraph();
  const useHook = shouldUseSubgraph ? useTokensViaSubGraph : useTokens;
  const res = useHook(tokensAddress);
  return res;
};
