import { usePangolinWeb3 } from '@pangolindex//shared';
import { ChainId, Pair, Token } from '@pangolindex/sdk';
import { useCallback, useMemo } from 'react';
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
