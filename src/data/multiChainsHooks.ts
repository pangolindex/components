import { ChainId } from '@pangolindex/sdk';
import { useTokenAllowance } from './Allowances';
import { useNearPairs, usePairs } from './Reserves';
import {
  useEvmPairTotalSupply,
  useHederaPairTotalSupply,
  useNearPairTotalSupply,
  useNearTotalSupply,
  useTotalSupply,
} from './TotalSupply';

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

export type UseTotalSupplyHookType = {
  [chainId in ChainId]: typeof useTotalSupply | typeof useNearTotalSupply;
};

/**
 * this hook is used to fetch total supply of given token based on chain
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export const useTotalSupplyHook: UseTotalSupplyHookType = {
  [ChainId.FUJI]: useTotalSupply,
  [ChainId.AVALANCHE]: useTotalSupply,
  [ChainId.WAGMI]: useTotalSupply,
  [ChainId.COSTON]: useTotalSupply,
  [ChainId.SONGBIRD]: useTotalSupply,
  [ChainId.HEDERA_TESTNET]: useTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearTotalSupply,
};

export type UsePairTotalSupplyHookType = {
  [chainId in ChainId]: typeof useEvmPairTotalSupply | typeof useNearPairTotalSupply | typeof useHederaPairTotalSupply;
};

/**
 * this hook is used to fetch total supply of given pair based on chain
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export const usePairTotalSupplyHook: UsePairTotalSupplyHookType = {
  [ChainId.FUJI]: useEvmPairTotalSupply,
  [ChainId.AVALANCHE]: useEvmPairTotalSupply,
  [ChainId.WAGMI]: useEvmPairTotalSupply,
  [ChainId.COSTON]: useEvmPairTotalSupply,
  [ChainId.SONGBIRD]: useEvmPairTotalSupply,
  [ChainId.HEDERA_TESTNET]: useHederaPairTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearPairTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearPairTotalSupply,
};
