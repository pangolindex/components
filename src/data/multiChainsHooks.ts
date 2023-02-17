import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import { useTokenAllowance } from './Allowances';
import { useHederaPairs, useNearPairs, usePairs } from './Reserves';
import {
  useEvmPairTotalSupply,
  useHederaPairTotalSupply,
  useHederaTotalSupply,
  useNearPairTotalSupply,
  useNearTotalSupply,
  usePairTotalSupplyViaSubgraph,
  useTotalSupply,
} from './TotalSupply';

export type UsePairsHookType = {
  [chainId in ChainId]: typeof usePairs | typeof useNearPairs | typeof useHederaPairs;
};

export const usePairsHook: UsePairsHookType = {
  [ChainId.FUJI]: usePairs,
  [ChainId.AVALANCHE]: usePairs,
  [ChainId.WAGMI]: usePairs,
  [ChainId.COSTON]: usePairs,
  [ChainId.SONGBIRD]: usePairs,
  [ChainId.FLARE_MAINNET]: usePairs,
  [ChainId.HEDERA_TESTNET]: useHederaPairs,
  [ChainId.HEDERA_MAINNET]: useHederaPairs,
  [ChainId.NEAR_MAINNET]: useNearPairs,
  [ChainId.NEAR_TESTNET]: useNearPairs,
  [ChainId.COSTON2]: usePairs,
  [ChainId.EVMOS_TESTNET]: usePairs,
  //TODO: We used usePairs for now, but we need to check following chains
  [ChainId.ETHEREUM]: usePairs,
  [ChainId.POLYGON]: usePairs,
  [ChainId.FANTOM]: usePairs,
  [ChainId.XDAI]: usePairs,
  [ChainId.BSC]: usePairs,
  [ChainId.ARBITRUM]: usePairs,
  [ChainId.CELO]: usePairs,
  [ChainId.OKXCHAIN]: usePairs,
  [ChainId.VELAS]: usePairs,
  [ChainId.AURORA]: usePairs,
  [ChainId.CRONOS]: usePairs,
  [ChainId.FUSE]: usePairs,
  [ChainId.MOONRIVER]: usePairs,
  [ChainId.MOONBEAM]: usePairs,
  [ChainId.OP]: usePairs,
};

export type UseTokenAllowanceHookType = {
  [chainId in ChainId]: typeof useTokenAllowance | typeof useDummyHook;
};

export const useTokenAllowanceHook: UseTokenAllowanceHookType = {
  [ChainId.FUJI]: useTokenAllowance,
  [ChainId.AVALANCHE]: useTokenAllowance,
  [ChainId.WAGMI]: useTokenAllowance,
  [ChainId.COSTON]: useTokenAllowance,
  [ChainId.SONGBIRD]: useTokenAllowance,
  [ChainId.FLARE_MAINNET]: useTokenAllowance,
  [ChainId.HEDERA_TESTNET]: useTokenAllowance,
  [ChainId.HEDERA_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_TESTNET]: useTokenAllowance,
  [ChainId.COSTON2]: useTokenAllowance,
  [ChainId.EVMOS_TESTNET]: useTokenAllowance,
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
};

export type UseTotalSupplyHookType = {
  [chainId in ChainId]:
    | typeof useTotalSupply
    | typeof useNearTotalSupply
    | typeof useDummyHook
    | typeof useHederaTotalSupply;
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
  [ChainId.FLARE_MAINNET]: useTotalSupply,
  [ChainId.HEDERA_TESTNET]: useHederaTotalSupply,
  [ChainId.HEDERA_MAINNET]: useHederaTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearTotalSupply,
  [ChainId.COSTON2]: useTotalSupply,
  [ChainId.EVMOS_TESTNET]: useTotalSupply,
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
};

export type UsePairTotalSupplyHookType = {
  [chainId in ChainId]:
    | typeof useEvmPairTotalSupply
    | typeof useNearPairTotalSupply
    | typeof useHederaPairTotalSupply
    | typeof usePairTotalSupplyViaSubgraph
    | typeof useDummyHook;
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
  [ChainId.FLARE_MAINNET]: useEvmPairTotalSupply,
  [ChainId.HEDERA_TESTNET]: usePairTotalSupplyViaSubgraph,
  [ChainId.HEDERA_MAINNET]: usePairTotalSupplyViaSubgraph,
  [ChainId.NEAR_MAINNET]: useNearPairTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearPairTotalSupply,
  [ChainId.COSTON2]: useEvmPairTotalSupply,
  [ChainId.EVMOS_TESTNET]: useEvmPairTotalSupply,
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
};
