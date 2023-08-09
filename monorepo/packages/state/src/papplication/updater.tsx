import { useChainId, useDebounce, useLibrary, usePangolinWeb3 } from '@pangolindex/hooks';
import { ChainId } from '@pangolindex/sdk';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLastBlockHook } from 'src/hooks/block';
import { useApplicationState } from './atom';

const NearApplicationUpdater = () => {
  const chainId = useChainId();
  const { provider } = useLibrary();
  const { updateBlockNumber } = useApplicationState();

  const { data: blockNumber } = useQuery(
    'get-block',
    () => {
      return provider?.getBlockNumber();
    },
    { enabled: !!provider, refetchInterval: 60 * 1000 * 2 },
  );

  useEffect(() => {
    if (blockNumber) {
      updateBlockNumber({ chainId, blockNumber });
    }
  }, [blockNumber]);

  return null;
};

export const EvmApplicationUpdater = () => {
  const { chainId } = usePangolinWeb3();
  const { provider } = useLibrary();
  const { updateBlockNumber } = useApplicationState();

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  });

  const useLastBlock = useLastBlockHook[(chainId ?? ChainId.AVALANCHE) as ChainId];

  const lastBlock = useLastBlock();

  const { data: providerBlockNumber } = useQuery(
    ['get-block-number-provider', chainId],
    async () => {
      try {
        if (provider) {
          const blockNumber: number = await provider?.getBlockNumber();
          return blockNumber;
        }
        return undefined;
      } catch (error) {}
    },
    {
      refetchInterval: 1000 * 20,
    },
  );

  useEffect(() => {
    if (providerBlockNumber || lastBlock) {
      setState((_state) => {
        if (chainId === _state.chainId) {
          if (typeof _state.blockNumber !== 'number') {
            return { chainId, blockNumber: Math.max(Number(providerBlockNumber ?? 0), Number(lastBlock?.number ?? 0)) };
          }
          return {
            chainId,
            blockNumber: Math.max(Number(providerBlockNumber ?? 0), Number(lastBlock?.number ?? 0), _state.blockNumber),
          };
        }
        return _state;
      });
    }
  }, [providerBlockNumber, lastBlock]);

  useEffect(() => {
    if (!chainId) return undefined;

    setState({ chainId, blockNumber: null });
  }, [chainId]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState?.blockNumber) return;
    updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState?.blockNumber });
  }, [debouncedState?.blockNumber, debouncedState.chainId]);

  return null;
};

const updaterMapping: { [chainId in ChainId]: () => null } = {
  [ChainId.AVALANCHE]: EvmApplicationUpdater,
  [ChainId.FUJI]: EvmApplicationUpdater,
  [ChainId.COSTON]: EvmApplicationUpdater,
  [ChainId.SONGBIRD]: EvmApplicationUpdater,
  [ChainId.FLARE_MAINNET]: EvmApplicationUpdater,
  [ChainId.HEDERA_TESTNET]: EvmApplicationUpdater,
  [ChainId.HEDERA_MAINNET]: EvmApplicationUpdater,
  [ChainId.WAGMI]: EvmApplicationUpdater,
  [ChainId.NEAR_MAINNET]: NearApplicationUpdater,
  [ChainId.NEAR_TESTNET]: NearApplicationUpdater,
  [ChainId.COSTON2]: EvmApplicationUpdater,
  [ChainId.EVMOS_TESTNET]: EvmApplicationUpdater,
  [ChainId.EVMOS_MAINNET]: EvmApplicationUpdater,
  //TODO: remove this once we have proper implementation
  [ChainId.ETHEREUM]: EvmApplicationUpdater,
  [ChainId.POLYGON]: EvmApplicationUpdater,
  [ChainId.FANTOM]: EvmApplicationUpdater,
  [ChainId.XDAI]: EvmApplicationUpdater,
  [ChainId.BSC]: EvmApplicationUpdater,
  [ChainId.ARBITRUM]: EvmApplicationUpdater,
  [ChainId.CELO]: EvmApplicationUpdater,
  [ChainId.OKXCHAIN]: EvmApplicationUpdater,
  [ChainId.VELAS]: EvmApplicationUpdater,
  [ChainId.AURORA]: EvmApplicationUpdater,
  [ChainId.CRONOS]: EvmApplicationUpdater,
  [ChainId.FUSE]: EvmApplicationUpdater,
  [ChainId.MOONRIVER]: EvmApplicationUpdater,
  [ChainId.MOONBEAM]: EvmApplicationUpdater,
  [ChainId.OP]: EvmApplicationUpdater,
  [ChainId.SKALE_BELLATRIX_TESTNET]: EvmApplicationUpdater,
};

export default function ApplicationUpdater() {
  const chainId = useChainId();

  const Updater = updaterMapping[chainId];

  return <Updater />;
}
