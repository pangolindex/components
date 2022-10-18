import { ChainId } from '@pangolindex/sdk';
import { useNearPairs, usePairs, useHederaPairs } from './Reserves';

export type UsePairsHookType = {
  [chainId in ChainId]: typeof usePairs | typeof useNearPairs | typeof useHederaPairs;
};

export const usePairsHook: UsePairsHookType = {
  [ChainId.FUJI]: usePairs,
  [ChainId.AVALANCHE]: usePairs,
  [ChainId.WAGMI]: usePairs,
  [ChainId.COSTON]: usePairs,
  [ChainId.SONGBIRD]: usePairs,
  [ChainId.HEDERA_TESTNET]: useHederaPairs,
  [ChainId.NEAR_MAINNET]: useNearPairs,
  [ChainId.NEAR_TESTNET]: useNearPairs,
};
