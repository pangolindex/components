import { Contract } from '@ethersproject/contracts';
import { ChainId, NetworkType } from '@pangolindex/sdk';
import {
  CancelledError,
  Hedera,
  RetryableError,
  chunkArray,
  getChainByNumber,
  retry,
  useChainId,
  useDebounce,
  useMulticallContract,
} from '@pangolindex/shared';
import { useEffect, useMemo, useRef } from 'react';
import { useBlockNumber } from '../application/hooks';
import { Call, MulticallState, parseCallKey, useMulticallAtom } from './atom';

// chunk calls so we do not exceed the gas limit
const CALL_CHUNK_SIZE = 500;
// for Hedera chain multicall not working with lots of calls because of gas limits, so reducing it down to less chunk size
const HEDERA_CALL_CHUNK_SIZE = 30;

/**
 * Fetches a chunk of calls, enforcing a minimum block number constraint
 * @param multicallContract multicall contract to fetch against
 * @param chunk chunk of calls to make
 * @param minBlockNumber minimum block number of the result set
 */
async function fetchChunk(
  multicallContract: Contract,
  chunk: Call[],
  minBlockNumber: number,
  chainId: ChainId,
): Promise<{ results: string[]; blockNumber: number }> {
  console.debug('Fetching chunk', multicallContract, chunk, minBlockNumber);

  const chain = getChainByNumber(chainId);
  const args: any = [chunk.map((obj) => [obj.address, obj.callData])];
  if (chain?.network_type === NetworkType.HEDERA) {
    args.push({
      gasLimit: 15_000_000,
    });
  }

  let resultsBlockNumber, returnData;
  try {
    [resultsBlockNumber, returnData] = await multicallContract.aggregate(...args);
  } catch (error) {
    console.debug('Failed to fetch chunk inside retry', error);
    throw error;
  }
  if (resultsBlockNumber.toNumber() < minBlockNumber) {
    throw new RetryableError('Fetched for old block number');
  }

  return { results: returnData, blockNumber: resultsBlockNumber.toNumber() };
}

/**
 * From the current all listeners state, return each call key mapped to the
 * minimum number of blocks per fetch. This is how often each key must be fetched.
 * @param allListeners the all listeners state
 * @param chainId the current chain id
 */
export function activeListeningKeys(
  allListeners: MulticallState['callListeners'],
  chainId?: number,
): { [callKey: string]: number } {
  if (!allListeners || !chainId) return {};
  const listeners = allListeners[chainId];
  if (!listeners) return {};

  return Object.keys(listeners).reduce<{ [callKey: string]: number }>((memo, callKey) => {
    const keyListeners = listeners[callKey];

    memo[callKey] = Object.keys(keyListeners)
      .filter((key) => {
        const blocksPerFetch = parseInt(key);
        if (blocksPerFetch <= 0) return false;
        return keyListeners[blocksPerFetch] > 0;
      })
      .reduce((previousMin, current) => {
        return Math.min(previousMin, parseInt(current));
      }, Infinity);
    return memo;
  }, {});
}

/**
 * Return the keys that need to be refetched
 * @param callResults current call result state
 * @param listeningKeys each call key mapped to how old the data can be in blocks
 * @param chainId the current chain id
 * @param latestBlockNumber the latest block number
 */
export function outdatedListeningKeys(
  callResults: MulticallState['callResults'],
  listeningKeys: { [callKey: string]: number },
  chainId: number | undefined,
  latestBlockNumber: number | undefined,
): string[] {
  if (!chainId || !latestBlockNumber) return [];
  const results = callResults[chainId];
  // no results at all, load everything
  if (!results) return Object.keys(listeningKeys);

  return Object.keys(listeningKeys).filter((callKey) => {
    const blocksPerFetch = listeningKeys[callKey];

    const data = callResults[chainId][callKey];
    // no data, must fetch
    if (!data) return true;

    const minDataBlockNumber = latestBlockNumber - (blocksPerFetch - 1);

    // already fetching it for a recent enough block, don't refetch it
    if (data.fetchingBlockNumber && data.fetchingBlockNumber >= minDataBlockNumber) return false;

    // if data is older than minDataBlockNumber, fetch it
    return !data?.blockNumber || data?.blockNumber < minDataBlockNumber;
  });
}

export default function Updater(): null {
  const { multicallState, fetchingMulticallResults, updateMulticallResults, errorFetchingMulticallResults } =
    useMulticallAtom();
  const state = multicallState;
  // wait for listeners to settle before triggering updates
  const debouncedListeners = useDebounce(state.callListeners, 100);
  const latestBlockNumber = useBlockNumber();
  const chainId = useChainId();
  const multicallContract = useMulticallContract();
  const cancellations = useRef<{ blockNumber: number; cancellations: (() => void)[] }>();

  const listeningKeys: { [callKey: string]: number } = useMemo(() => {
    return activeListeningKeys(debouncedListeners, chainId);
  }, [debouncedListeners, chainId]);

  const unserializedOutdatedCallKeys = useMemo(() => {
    return outdatedListeningKeys(state.callResults, listeningKeys, chainId, latestBlockNumber);
  }, [chainId, state.callResults, listeningKeys, latestBlockNumber]);

  const serializedOutdatedCallKeys = useMemo(
    () => JSON.stringify(unserializedOutdatedCallKeys.sort()),
    [unserializedOutdatedCallKeys],
  );

  useEffect(() => {
    if (!latestBlockNumber || !chainId || !multicallContract) return;

    const outdatedCallKeys: string[] = JSON.parse(serializedOutdatedCallKeys);
    if (outdatedCallKeys.length === 0) return;
    const calls = outdatedCallKeys.map((key) => parseCallKey(key));

    const chunkSize = Hedera.isHederaChain(chainId) ? HEDERA_CALL_CHUNK_SIZE : CALL_CHUNK_SIZE;

    const chunkedCalls = chunkArray(calls, chunkSize);

    if (cancellations.current?.blockNumber !== latestBlockNumber) {
      cancellations.current?.cancellations?.forEach((c) => c());
    }

    fetchingMulticallResults({
      calls,
      chainId,
      fetchingBlockNumber: latestBlockNumber,
    });

    cancellations.current = {
      blockNumber: latestBlockNumber,
      cancellations: chunkedCalls.map((chunk, index) => {
        const { cancel, promise } = retry(() => fetchChunk(multicallContract, chunk, latestBlockNumber, chainId), {
          n: Infinity,
          minWait: 2500,
          maxWait: 3500,
        });
        promise
          .then(({ results: returnData, blockNumber: fetchBlockNumber }) => {
            cancellations.current = { cancellations: [], blockNumber: latestBlockNumber };

            // accumulates the length of all previous indices
            const firstCallKeyIndex = chunkedCalls
              .slice(0, index)
              .reduce<number>((memo, curr) => memo + curr.length, 0);
            const lastCallKeyIndex = firstCallKeyIndex + returnData.length;

            updateMulticallResults({
              chainId,
              results: outdatedCallKeys
                .slice(firstCallKeyIndex, lastCallKeyIndex)
                .reduce<{ [callKey: string]: string | null }>((memo, callKey, i) => {
                  memo[callKey] = returnData[i] ?? null;
                  return memo;
                }, {}),
              blockNumber: fetchBlockNumber,
            });
          })
          .catch((error: any) => {
            if (error instanceof CancelledError) {
              console.debug('Cancelled fetch for blockNumber', latestBlockNumber);
              return;
            }
            console.error('Failed to fetch multicall chunk', chunk, chainId, error);

            errorFetchingMulticallResults({
              calls: chunk,
              chainId,
              fetchingBlockNumber: latestBlockNumber,
            });
          });
        return cancel;
      }),
    };
  }, [chainId, multicallContract, serializedOutdatedCallKeys, latestBlockNumber]);

  return null;
}
