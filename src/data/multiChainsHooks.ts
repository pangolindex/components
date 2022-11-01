import { ChainId } from '@pangolindex/sdk';
import { useTokenAllowance } from './Allowances';
import { useNearPairs, usePairs } from './Reserves';

export type UsePairsHookType = {
  [chainId in ChainId]: typeof usePairs | typeof useNearPairs;
};

export const usePairsHook: UsePairsHookType = {
  [ChainId.FUJI]: usePairs,
  [ChainId.AVALANCHE]: usePairs,
  [ChainId.WAGMI]: usePairs,
  [ChainId.COSTON]: usePairs,
  [ChainId.SONGBIRD]: usePairs,
  [ChainId.HEDERA_TESTNET]: usePairs,
  [ChainId.NEAR_MAINNET]: useNearPairs,
  [ChainId.NEAR_TESTNET]: useNearPairs,
};

export type UseTokenAllowanceHookType = {
  [chainId in ChainId]: typeof useTokenAllowance;
};

export const useTokenAllowanceHook: UseTokenAllowanceHookType = {
  [ChainId.FUJI]: useTokenAllowance,
  [ChainId.AVALANCHE]: useTokenAllowance,
  [ChainId.WAGMI]: useTokenAllowance,
  [ChainId.COSTON]: useTokenAllowance,
  [ChainId.SONGBIRD]: useTokenAllowance,
  [ChainId.HEDERA_TESTNET]: useTokenAllowance,
  [ChainId.NEAR_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_TESTNET]: useTokenAllowance,
};
