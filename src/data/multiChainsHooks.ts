import { ChainId } from '@pangolindex/sdk';
import { useNearPairs, usePairs } from './Reserves';

export type usePairsHookType = {
  [chainId in ChainId]: typeof usePairs | typeof useNearPairs;
};

export const usePairsHook: usePairsHookType = {
  [ChainId.FUJI]: usePairs,
  [ChainId.AVALANCHE]: usePairs,
  [ChainId.WAGMI]: usePairs,
  [ChainId.COSTON]: usePairs,
  [ChainId.SONGBIRD]: usePairs,
  [ChainId.NEAR_MAINNET]: useNearPairs,
  [ChainId.NEAR_TESTNET]: useNearPairs,
};
