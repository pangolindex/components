import { Token } from '@pangolindex/sdk';
import {
  BASES_TO_TRACK_LIQUIDITY_FOR,
  PINNED_PAIRS,
  useChainId,
  useLibrary,
  usePangolinWeb3,
} from '@honeycomb/shared';
import { useAllTokens, useUserAtom } from '@honeycomb/state-hooks';
import { splitSignature } from 'ethers/lib/utils';
import flatMap from 'lodash.flatmap';
import { useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { deserializeToken } from 'src/utils';

export const useRefetchMinichefSubgraph = () => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  return async () => await queryClient.refetchQueries(['get-minichef-farms-v2', account, chainId]);
};

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = usePangolinWeb3();
  const { userState } = useUserAtom();
  const tokens = useAllTokens();

  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId]);

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress];
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null;
                  } else {
                    return [base, token];
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            );
          })
        : [],
    [tokens, chainId],
  );

  // pairs saved by users
  const savedSerializedPairs = userState.pairs;

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return [];
    const forChain = savedSerializedPairs[chainId];
    if (!forChain) return [];

    return Object.keys(forChain).map((pairId) => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)];
    });
  }, [savedSerializedPairs, chainId]);

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs],
  );

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB);
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`;
      if (memo[key]) return memo;
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA];
      return memo;
    }, {});

    return Object.keys(keyed).map((key) => keyed[key]);
  }, [combinedList]);
}

export function useGetTransactionSignature() {
  const { provider } = useLibrary();
  const { account } = usePangolinWeb3();

  const getSignature = async (data) => {
    try {
      const rawSignature = await provider.execute('eth_signTypedData_v4', [account, data]);
      return splitSignature(rawSignature);
    } catch (err: any) {
      if (err?.code !== 4001) {
        throw err;
      }
    }
  };

  return getSignature;
}
