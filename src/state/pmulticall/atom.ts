import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export interface Call {
  address: string;
  callData: string;
}

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const LOWER_HEX_REGEX = /^0x[a-f0-9]*$/;
export function toCallKey(call: Call): string {
  if (!ADDRESS_REGEX.test(call.address)) {
    throw new Error(`Invalid address: ${call.address}`);
  }
  if (!LOWER_HEX_REGEX.test(call.callData)) {
    throw new Error(`Invalid hex: ${call.callData}`);
  }
  return `${call.address}-${call.callData}`;
}

export function parseCallKey(callKey: string): Call {
  const pcs = callKey.split('-');
  if (pcs.length !== 2) {
    throw new Error(`Invalid call key: ${callKey}`);
  }
  return {
    address: pcs[0],
    callData: pcs[1],
  };
}

export interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch?: number;
}

export interface MulticallState {
  callListeners?: {
    // on a per-chain basis
    [chainId: number]: {
      // stores for each call key the listeners' preferences
      [callKey: string]: {
        // stores how many listeners there are per each blocks per fetch preference
        [blocksPerFetch: number]: number;
      };
    };
  };

  callResults: {
    [chainId: number]: {
      [callKey: string]: {
        data?: string | null;
        blockNumber?: number;
        fetchingBlockNumber?: number;
      };
    };
  };
}

const initialState: MulticallState = {
  callResults: {},
};

export const multicallAtom = atom<MulticallState>(initialState);

export function useMulticallAtom() {
  const [multicallState, setMulticallState] = useAtom(multicallAtom);

  const addMulticallListeners = useCallback(
    ({
      calls,
      chainId,
      options: { blocksPerFetch = 1 } = {},
    }: {
      calls: any[];
      chainId: number;
      options?: ListenerOptions;
    }) => {
      setMulticallState((prev) => {
        const listeners: MulticallState['callListeners'] = prev.callListeners
          ? prev.callListeners
          : (prev.callListeners = {});
        listeners[chainId] = listeners[chainId] ?? {};

        calls.forEach((call) => {
          const callKey = toCallKey(call);
          listeners[chainId][callKey] = listeners[chainId][callKey] ?? {};
          listeners[chainId][callKey][blocksPerFetch] = (listeners[chainId][callKey][blocksPerFetch] ?? 0) + 1;
        });

        return { ...prev, callListeners: listeners };
      });
    },
    [setMulticallState],
  );

  const removeMulticallListeners = useCallback(
    ({
      calls,
      chainId,
      options: { blocksPerFetch = 1 } = {},
    }: {
      calls: any[];
      chainId: number;
      options?: ListenerOptions;
    }) => {
      setMulticallState((prev) => {
        const listeners: MulticallState['callListeners'] = prev.callListeners
          ? prev.callListeners
          : (prev.callListeners = {});

        if (!listeners[chainId]) return prev;
        calls.forEach((call) => {
          const callKey = toCallKey(call);
          if (!listeners[chainId][callKey]) return;
          if (!listeners[chainId][callKey][blocksPerFetch]) return;

          if (listeners[chainId][callKey][blocksPerFetch] === 1) {
            delete listeners[chainId][callKey][blocksPerFetch];
          } else {
            listeners[chainId][callKey][blocksPerFetch]--;
          }
        });
        return { ...prev, callListeners: listeners };
      });
    },
    [setMulticallState],
  );

  const fetchingMulticallResults = useCallback(
    ({ chainId, fetchingBlockNumber, calls }: { chainId: number; fetchingBlockNumber: number; calls: any[] }) => {
      setMulticallState((state) => {
        state.callResults[chainId] = state.callResults[chainId] ?? {};

        calls.forEach((call) => {
          const callKey = toCallKey(call);
          const current = state.callResults?.[chainId]?.[callKey];
          if (!current) {
            state.callResults[chainId][callKey] = {
              fetchingBlockNumber,
            };
          } else {
            if ((current.fetchingBlockNumber ?? 0) >= fetchingBlockNumber) return;
            state.callResults[chainId][callKey].fetchingBlockNumber = fetchingBlockNumber;
          }
        });
        return state;
      });
    },
    [setMulticallState],
  );

  const errorFetchingMulticallResults = useCallback(
    ({ chainId, fetchingBlockNumber, calls }: { chainId: number; fetchingBlockNumber: number; calls: any[] }) => {
      setMulticallState((state) => {
        state.callResults[chainId] = state.callResults[chainId] ?? {};
        calls.forEach((call) => {
          const callKey = toCallKey(call);
          const current = state.callResults[chainId][callKey];
          if (!current) return; // only should be dispatched if we are already fetching
          if (current.fetchingBlockNumber === fetchingBlockNumber) {
            delete current.fetchingBlockNumber;
            current.data = null;
            current.blockNumber = fetchingBlockNumber;
          }
        });
        return state;
      });
    },
    [setMulticallState],
  );

  const updateMulticallResults = useCallback(
    ({
      chainId,
      results,
      blockNumber,
    }: {
      chainId: number;
      results: {
        [callKey: string]: string | null;
      };
      blockNumber: number;
    }) => {
      setMulticallState((state) => {
        state.callResults[chainId] = state.callResults[chainId] ?? {};
        Object.keys(results).forEach((callKey) => {
          const current = state.callResults[chainId][callKey];
          if ((current?.blockNumber ?? 0) > blockNumber) return;
          state.callResults[chainId][callKey] = {
            data: results[callKey],
            blockNumber,
          };
        });

        return state;
      });
    },
    [setMulticallState],
  );

  return {
    multicallState,
    addMulticallListeners,
    removeMulticallListeners,
    fetchingMulticallResults,
    errorFetchingMulticallResults,
    updateMulticallResults,
  };
}
