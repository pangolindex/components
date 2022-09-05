import { ChainId } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import useDebounce from 'src/hooks/useDebounce';
import useIsWindowVisible from 'src/hooks/useIsWindowVisible';
import { useDispatch } from 'src/state';
import { updateBlockNumber } from './actions';

const NearApplicationUpdater = () => {
  const chainId = useChainId();
  const { provider } = useLibrary();
  const dispatch = useDispatch();

  const { data: blockNumber } = useQuery(
    'get-block',
    () => {
      return provider?.getBlockNumber();
    },
    { enabled: !!provider, refetchInterval: 60 * 1000 * 2 },
  );

  useEffect(() => {
    if (blockNumber) {
      dispatch(updateBlockNumber({ chainId, blockNumber }));
    }
  }, [blockNumber]);

  return null;
};

export const EvmApplicationUpdater = () => {
  const { chainId } = usePangolinWeb3();
  const { library, provider } = useLibrary();
  const dispatch = useDispatch();

  const windowVisible = useIsWindowVisible();

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((_state) => {
        if (chainId === _state.chainId) {
          if (typeof _state.blockNumber !== 'number') return { chainId, blockNumber };
          return { chainId, blockNumber: Math.max(blockNumber, _state.blockNumber) };
        }
        return _state;
      });
    },
    [chainId, setState],
  );

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined;

    setState({ chainId, blockNumber: null });

    provider
      ?.getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error));

    library.on && library.on('block', blockNumberCallback);
    return () => {
      library.removeListener && library.removeListener('block', blockNumberCallback);
    };
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState?.blockNumber || !windowVisible) return;
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState?.blockNumber }));
  }, [windowVisible, dispatch, debouncedState?.blockNumber, debouncedState.chainId]);

  return null;
};

const updaterMapping: { [chainId in ChainId]: () => null } = {
  [ChainId.AVALANCHE]: EvmApplicationUpdater,
  [ChainId.FUJI]: EvmApplicationUpdater,
  [ChainId.COSTON]: EvmApplicationUpdater,
  [ChainId.SONGBIRD]: EvmApplicationUpdater,
  [ChainId.WAGMI]: EvmApplicationUpdater,
  [ChainId.NEAR_MAINNET]: NearApplicationUpdater,
  [ChainId.NEAR_TESTNET]: NearApplicationUpdater,
};

export default function ApplicationUpdater() {
  const chainId = useChainId();

  const Updater = updaterMapping[chainId];

  return <Updater />;
}
