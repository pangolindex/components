import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';
import { DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from '@pangolindex/constants';

export interface SerializedToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface SerializedPair {
  token0: SerializedToken;
  token1: SerializedToken;
}

const currentTimestamp = () => new Date().getTime();

export interface UserState {
  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number;
  timestamp: number;
  userExpertMode: boolean;
  // deadline set by user in minutes, used in all txns
  userDeadline: string;
  userShowBalances: boolean;
  // true if you are going to use approve as much as you can
  userApproveInfinite: boolean;
  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken;
    };
  };
  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair;
    };
  };
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`;
}

export const initialState: UserState = {
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  tokens: {},
  timestamp: currentTimestamp(),
  userExpertMode: false,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  userShowBalances: true,
  userApproveInfinite: true,
  pairs: {},
};

const localstorageKey = 'user_pangolin';
const userAtom = atomWithStorage<UserState>(localstorageKey, initialState);

export function useUserAtom() {
  const [userState, setUserState] = useAtom(userAtom);

  const updateUserSlippageTolerance = useCallback(
    ({ userSlippageTolerance }: { userSlippageTolerance: number }) => {
      setUserState((state) => ({
        ...state,
        userSlippageTolerance,
        timestamp: currentTimestamp(),
      }));
    },
    [setUserState],
  );

  const updateUserExpertMode = useCallback(
    ({ userExpertMode }: { userExpertMode: boolean }) => {
      setUserState((state) => ({
        ...state,
        userExpertMode,
        timestamp: currentTimestamp(),
      }));
    },
    [setUserState],
  );

  const updateUserDeadline = useCallback(
    ({ userDeadline }: { userDeadline: string }) => {
      setUserState((state) => ({
        ...state,
        userDeadline,
        timestamp: currentTimestamp(),
      }));
    },
    [setUserState],
  );

  const updateUserShowBalances = useCallback(
    ({ userShowBalances }: { userShowBalances: boolean }) => {
      setUserState((state) => ({
        ...state,
        userShowBalances,
      }));
    },
    [setUserState],
  );

  const updateUserApproveInfinite = useCallback(
    ({ userApproveInfinite }: { userApproveInfinite: boolean }) => {
      setUserState((state) => ({
        ...state,
        userApproveInfinite,
      }));
    },
    [setUserState],
  );

  const addSerializedToken = useCallback(
    ({ serializedToken }: { serializedToken: SerializedToken }) => {
      setUserState((state) => {
        const newState = { ...state };
        newState.tokens[serializedToken.chainId] = newState.tokens[serializedToken.chainId] || {};
        newState.tokens[serializedToken.chainId][serializedToken.address] = serializedToken;
        newState.timestamp = currentTimestamp();
        return newState;
      });
    },
    [setUserState],
  );

  const removeSerializedToken = useCallback(
    ({ address, chainId }: { address: string; chainId: number }) => {
      setUserState((state) => {
        const tokens = state.tokens[chainId] || {};
        delete tokens[address];
        return {
          ...state,
          tokens: {
            ...state.tokens,
            [chainId]: tokens,
          },
          timestamp: currentTimestamp(),
        };
      });
    },
    [setUserState],
  );

  const addSerializedPair = useCallback(
    ({ serializedPair }: { serializedPair: SerializedPair }) => {
      setUserState((state) => {
        if (
          serializedPair.token0.chainId === serializedPair.token1.chainId &&
          serializedPair.token0.address !== serializedPair.token1.address
        ) {
          const chainId = serializedPair.token0.chainId;
          const pairs = state.pairs[chainId] || {};
          pairs[pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair;
          return {
            ...state,
            pairs: {
              ...state.pairs,
              [chainId]: pairs,
            },
            timestamp: currentTimestamp(),
          };
        }
        return state;
      });
    },
    [setUserState],
  );

  return {
    userState,
    updateUserSlippageTolerance,
    updateUserExpertMode,
    updateUserDeadline,
    updateUserShowBalances,
    updateUserApproveInfinite,
    addSerializedToken,
    removeSerializedToken,
    addSerializedPair,
  };
}
