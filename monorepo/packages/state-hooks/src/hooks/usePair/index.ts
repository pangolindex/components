import { ChainId, Currency, Pair } from '@pangolindex/sdk';
import { PairState, useChainId } from '@pangolindex/shared';
import { useMemo } from 'react';
import { usePairs, usePairsContract, usePairsViaSubgraph } from './evm';
import { useNearPairs, useGetNearAllPool, useGetNearPoolId } from './near';

export type UsePairsHookType = {
  [chainId in ChainId]: typeof usePairsContract | typeof useNearPairs | typeof usePairsViaSubgraph | typeof usePairs;
};

export const usePairsHook: UsePairsHookType = {
  [ChainId.FUJI]: usePairsContract,
  [ChainId.AVALANCHE]: usePairsContract,
  [ChainId.WAGMI]: usePairsContract,
  [ChainId.COSTON]: usePairsContract,
  [ChainId.SONGBIRD]: usePairsContract,
  [ChainId.FLARE_MAINNET]: usePairsContract,
  [ChainId.HEDERA_TESTNET]: usePairs,
  [ChainId.HEDERA_MAINNET]: usePairs,
  [ChainId.NEAR_MAINNET]: useNearPairs,
  [ChainId.NEAR_TESTNET]: useNearPairs,
  [ChainId.COSTON2]: usePairsContract,
  [ChainId.EVMOS_TESTNET]: usePairsContract,
  [ChainId.EVMOS_MAINNET]: usePairsContract,
  //TODO: We used usePairs for now, but we need to check following chains
  [ChainId.ETHEREUM]: usePairsContract,
  [ChainId.POLYGON]: usePairsContract,
  [ChainId.FANTOM]: usePairsContract,
  [ChainId.XDAI]: usePairsContract,
  [ChainId.BSC]: usePairsContract,
  [ChainId.ARBITRUM]: usePairsContract,
  [ChainId.CELO]: usePairsContract,
  [ChainId.OKXCHAIN]: usePairsContract,
  [ChainId.VELAS]: usePairsContract,
  [ChainId.AURORA]: usePairsContract,
  [ChainId.CRONOS]: usePairsContract,
  [ChainId.FUSE]: usePairsContract,
  [ChainId.MOONRIVER]: usePairsContract,
  [ChainId.MOONBEAM]: usePairsContract,
  [ChainId.OP]: usePairsContract,
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePairsContract,
};

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  const chainId = useChainId();

  const tokens: [Currency | undefined, Currency | undefined][] = useMemo(() => [[tokenA, tokenB]], [tokenA, tokenB]);

  const usePairs_ = usePairsHook[chainId];
  return usePairs_(tokens)[0];
}

export { usePairs, usePairsContract, usePairsViaSubgraph, useNearPairs, useGetNearAllPool, useGetNearPoolId };
