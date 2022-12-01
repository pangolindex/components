import { ChainId } from '@pangolindex/sdk';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import useDebounce from 'src/hooks/useDebounce';
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
  const { provider } = useLibrary();
  const dispatch = useDispatch();

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  });

  useQuery(
    ['blocknumber'],
    async () => {
      try {
        if (provider) {
          const blockNumber = await provider?.getBlockNumber();
          setState((_state) => {
            if (chainId === _state.chainId) {
              if (typeof _state.blockNumber !== 'number') return { chainId, blockNumber };
              return { chainId, blockNumber: Math.max(blockNumber, _state.blockNumber) };
            }
            return _state;
          });
        }
      } catch (error) {}
    },
    {
      refetchInterval: 1000 * 30,
    },
  );

  useEffect(() => {
    if (!chainId) return undefined;

    setState({ chainId, blockNumber: null });
  }, [chainId]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState?.blockNumber) return;
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState?.blockNumber }));
  }, [dispatch, debouncedState?.blockNumber, debouncedState.chainId]);

  return null;
};

const updaterMapping: { [chainId in ChainId]: () => null } = {
  [ChainId.AVALANCHE]: EvmApplicationUpdater,
  [ChainId.FUJI]: EvmApplicationUpdater,
  [ChainId.COSTON]: EvmApplicationUpdater,
  [ChainId.SONGBIRD]: EvmApplicationUpdater,
  [ChainId.HEDERA_TESTNET]: EvmApplicationUpdater,
  [ChainId.WAGMI]: EvmApplicationUpdater,
  [ChainId.NEAR_MAINNET]: NearApplicationUpdater,
  [ChainId.NEAR_TESTNET]: NearApplicationUpdater,
  [ChainId.EVMOS_TESTNET]: EvmApplicationUpdater,
};

export default function ApplicationUpdater() {
  const chainId = useChainId();

  const Updater = updaterMapping[chainId];

  return <Updater />;
}
