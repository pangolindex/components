import { ChainId, Token } from '@pangolindex/sdk';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePangolinWeb3 } from '../../hooks';
import { AppDispatch, AppState } from '../index';
import {
  SerializedToken,
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
  const dispatch = useDispatch<AppDispatch>();
  const userSlippageTolerance = useSelector<AppState, AppState['puser']['userSlippageTolerance']>((state) => {
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
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch],
  );
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch],
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = usePangolinWeb3();
  const serializedTokensMap = useSelector<AppState, AppState['puser']['tokens']>(({ puser: { tokens } }) => tokens);

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap[chainId as ChainId] ?? {}).map(deserializeToken);
  }, [serializedTokensMap, chainId]);
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['puser']['userExpertMode']>((state) => state.puser.userExpertMode);
}

export function useExpertModeManager(): [boolean, (value: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>();
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
  const dispatch = useDispatch<AppDispatch>();
  const userDeadline = useSelector<AppState, AppState['puser']['userDeadline']>((state) => state.puser.userDeadline);

  const setUserDeadline = useCallback(
    (userDeadline: string) => {
      dispatch(updateUserDeadline({ userDeadline: userDeadline }));
    },
    [dispatch],
  );

  return [userDeadline, setUserDeadline];
}
