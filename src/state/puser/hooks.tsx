import { ChainId, Pair, Token } from '@pangolindex/sdk';
import flatMap from 'lodash.flatmap';
import { useCallback, useMemo } from 'react';
import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from 'src/constants';
import { AppState, useDispatch, useSelector } from 'src/state';
import { usePangolinWeb3 } from '../../hooks';
import { useAllTokens } from '../../hooks/Tokens';
import {
  SerializedPair,
  SerializedToken,
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSlippageTolerance,
} from './actions';

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
  const dispatch = useDispatch();
  const userSlippageTolerance = useSelector<AppState['puser']['userSlippageTolerance']>((state) => {
    return state.puser.userSlippageTolerance;
  });

  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance: userSlippageTolerance }));
    },
    [dispatch],
  );

  return [userSlippageTolerance, setUserSlippageTolerance];
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch],
  );
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch],
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = usePangolinWeb3();
  const serializedTokensMap = useSelector<AppState['puser']['tokens']>(({ puser: { tokens } }) => tokens);

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap[chainId as ChainId] ?? {}).map(deserializeToken);
  }, [serializedTokensMap, chainId]);
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState['puser']['userExpertMode']>((state) => state.puser.userExpertMode);
}

export function useExpertModeManager(): [boolean, (value: boolean) => void] {
  const dispatch = useDispatch();
  const expertMode = useIsExpertMode();

  const setExpertMode = useCallback(
    (value: boolean) => {
      dispatch(updateUserExpertMode({ userExpertMode: value }));
    },
    [dispatch],
  );

  return [expertMode, setExpertMode];
}

export function useUserDeadline(): [string, (deadline: string) => void] {
  const dispatch = useDispatch();
  const userDeadline = useSelector<AppState['puser']['userDeadline']>((state) => state.puser.userDeadline);

  const setUserDeadline = useCallback(
    (userDeadline: string) => {
      dispatch(updateUserDeadline({ userDeadline: userDeadline }));
    },
    [dispatch],
  );

  return [userDeadline, setUserDeadline];
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
  const savedSerializedPairs = useSelector<AppState['puser']['pairs']>(({ puser: { pairs } }) => pairs);

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
  const dispatch = useDispatch();

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }));
    },
    [dispatch],
  );
}
