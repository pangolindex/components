import { Pair, TokenAmount } from '@pangolindex/sdk';
import { useHederaPGLTokenAddresses } from '../wallet/hooks/hedera';
import { useHederaTokensMetaData } from '@pangolindex/state-hooks';
import { useMemo } from 'react';
import { useSubgraphPairs } from '@pangolindex/shared';

/**
 * this hook is used to fetch total supply of given pair
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function useHederaPairTotalSupply(pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;

  const lpTokenAddresses = token?.address;

  const pglTokenAddresses = useHederaPGLTokenAddresses([lpTokenAddresses]);

  const tokensMetadata = useHederaTokensMetaData([lpTokenAddresses ? pglTokenAddresses[lpTokenAddresses] : undefined]);

  return useMemo(() => {
    if (!token || !lpTokenAddresses || !pglTokenAddresses || !tokensMetadata) {
      return undefined;
    }

    const pglTokenAddress = pglTokenAddresses[lpTokenAddresses];

    const totalSupply = pglTokenAddress ? tokensMetadata[pglTokenAddress]?.totalSupply : '0';

    return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined;
  }, [token, lpTokenAddresses, tokensMetadata, pglTokenAddresses]);
}

/**
 * this hook is used to fetch total supply of given pair via subgraph
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function usePairTotalSupplyViaSubgraph(pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;
  // get pair from subgraph
  const { data, isLoading } = useSubgraphPairs([token?.address]);

  return useMemo(() => {
    if (!token || isLoading || !data || data.length === 0) return undefined;

    const pairInfo = data[0];
    if (pairInfo.id !== token.address) return undefined;

    return new TokenAmount(token, pairInfo.totalSupply);
  }, [token, data, isLoading]);
}
