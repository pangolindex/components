import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS, usePangolinWeb3 } from '@pangolindex//shared';
import { ChainId, Pair, Token } from '@pangolindex/sdk';
import flatMap from 'lodash.flatmap';
import { useCallback, useMemo } from 'react';
import { useAllTokens } from 'src/hooks/useAllTokens';
import { SerializedPair, SerializedToken, useUserAtom } from './atom';

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}

export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const { userState, updateUserSlippageTolerance } = useUserAtom();

  const userSlippageTolerance = userState.userSlippageTolerance;

  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: number) => {
      updateUserSlippageTolerance({ userSlippageTolerance: userSlippageTolerance });
    },
    [updateUserSlippageTolerance],
  );

  return [userSlippageTolerance, setUserSlippageTolerance];
}

export function useAddUserToken(): (token: Token) => void {
  const { addSerializedToken } = useUserAtom();
  return useCallback(
    (token: Token) => {
      addSerializedToken({ serializedToken: serializeToken(token) });
    },
    [addSerializedToken],
  );
}
/*not used anywhere */
export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const { removeSerializedToken } = useUserAtom();
  return useCallback(
    (chainId: number, address: string) => {
      removeSerializedToken({ chainId, address });
    },
    [removeSerializedToken],
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = usePangolinWeb3();

  const { userState } = useUserAtom();

  const serializedTokensMap = userState.tokens;

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap[chainId as ChainId] ?? {}).map(deserializeToken);
  }, [serializedTokensMap, chainId]);
}

export function useIsExpertMode(): boolean {
  const { userState } = useUserAtom();

  return userState.userExpertMode;
}

export function useExpertModeManager(): [boolean, (value: boolean) => void] {
  const { updateUserExpertMode } = useUserAtom();

  const expertMode = useIsExpertMode();

  const setExpertMode = useCallback(
    (value: boolean) => {
      updateUserExpertMode({ userExpertMode: value });
    },
    [updateUserExpertMode],
  );

  return [expertMode, setExpertMode];
}

export function useUserDeadline(): [string, (deadline: string) => void] {
  const { userState, updateUserDeadline } = useUserAtom();
  const userDeadline = userState.userDeadline;

  const setUserDeadline = useCallback(
    (userDeadline: string) => {
      updateUserDeadline({ userDeadline: userDeadline });
    },
    [updateUserDeadline],
  );

  return [userDeadline, setUserDeadline];
}

export function useIsShowingBalances(): boolean {
  const { userState } = useUserAtom();

  return userState.userShowBalances;
}

export function useShowBalancesManager(): [boolean, (value: boolean) => void] {
  const { updateUserShowBalances } = useUserAtom();
  const showBalances = useIsShowingBalances();

  const setShowBalances = useCallback(
    (value: boolean) => {
      updateUserShowBalances({ userShowBalances: value });
    },
    [updateUserShowBalances],
  );

  return [showBalances, setShowBalances];
}

export function useIsApprovingInfinite(): boolean {
  const { userState } = useUserAtom();
  return userState.userApproveInfinite;
}
/*not used anywhere */
export function useApproveManager(): [boolean, (value: boolean) => void] {
  const { updateUserApproveInfinite } = useUserAtom();

  const isApprovingInfinity = useIsApprovingInfinite();

  const setApprove = useCallback(
    (value: boolean) => {
      updateUserApproveInfinite({ userApproveInfinite: value });
    },
    [updateUserApproveInfinite],
  );

  return [isApprovingInfinity, setApprove];
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token], chainId: ChainId): Token {
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB, chainId), 18, 'PGL', 'Pangolin Liquidity');
}

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

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  };
}

export function usePairAdder(): (pair: Pair) => void {
  const { addSerializedPair } = useUserAtom();

  return useCallback(
    (pair: Pair) => {
      addSerializedPair({ serializedPair: serializePair(pair) });
    },
    [addSerializedPair],
  );
}
