import { Token } from '@pangolindex/sdk';
import { useChainId } from '@honeycomb/shared';
import { useMemo } from 'react';
import { useSelectedTokenList } from 'src/state/lists/hooks';
import { useUserAddedTokens } from 'src/state/user/hooks';

/**
 * get all tokens
 * @returns
 */
export function useAllTokens(): { [address: string]: Token } {
  const chainId = useChainId();

  const userAddedTokens = useUserAddedTokens();
  const allTokens = useSelectedTokenList();
  return useMemo(() => {
    if (!chainId) return {};
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token;
            return tokenMap;
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId] },
        )
    );
  }, [chainId, userAddedTokens, allTokens]);
}
