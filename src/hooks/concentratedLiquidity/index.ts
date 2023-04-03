import { ChainId } from '@pangolindex/sdk';
import { useDummyFeeTierDistribution, useDummyPoolTVL, useDummyPools } from './dummy';
import { useFeeTierDistribution, usePoolTVL, usePools } from './evm';

export type UsePoolsHookType = {
  [chainId in ChainId]: typeof usePools | typeof useDummyPools;
};

export const usePoolsHook: UsePoolsHookType = {
  [ChainId.FUJI]: usePools,
  [ChainId.AVALANCHE]: useDummyPools,
  [ChainId.WAGMI]: useDummyPools,
  [ChainId.COSTON]: useDummyPools,
  [ChainId.SONGBIRD]: useDummyPools,
  [ChainId.FLARE_MAINNET]: useDummyPools,
  [ChainId.HEDERA_TESTNET]: useDummyPools,
  [ChainId.HEDERA_MAINNET]: useDummyPools,
  [ChainId.NEAR_MAINNET]: useDummyPools,
  [ChainId.NEAR_TESTNET]: useDummyPools,
  [ChainId.COSTON2]: useDummyPools,
  [ChainId.EVMOS_TESTNET]: useDummyPools,
  [ChainId.EVMOS_MAINNET]: useDummyPools,
  [ChainId.ETHEREUM]: useDummyPools,
  [ChainId.POLYGON]: useDummyPools,
  [ChainId.FANTOM]: useDummyPools,
  [ChainId.XDAI]: useDummyPools,
  [ChainId.BSC]: useDummyPools,
  [ChainId.ARBITRUM]: useDummyPools,
  [ChainId.CELO]: useDummyPools,
  [ChainId.OKXCHAIN]: useDummyPools,
  [ChainId.VELAS]: useDummyPools,
  [ChainId.AURORA]: useDummyPools,
  [ChainId.CRONOS]: useDummyPools,
  [ChainId.FUSE]: useDummyPools,
  [ChainId.MOONRIVER]: useDummyPools,
  [ChainId.MOONBEAM]: useDummyPools,
  [ChainId.OP]: useDummyPools,
};

export type UsePoolTVLHookType = {
  [chainId in ChainId]: typeof usePoolTVL | typeof useDummyPoolTVL;
};

export const usePoolTVLHook: UsePoolTVLHookType = {
  [ChainId.FUJI]: usePoolTVL,
  [ChainId.AVALANCHE]: useDummyPoolTVL,
  [ChainId.WAGMI]: useDummyPoolTVL,
  [ChainId.COSTON]: useDummyPoolTVL,
  [ChainId.SONGBIRD]: useDummyPoolTVL,
  [ChainId.FLARE_MAINNET]: useDummyPoolTVL,
  [ChainId.HEDERA_TESTNET]: useDummyPoolTVL,
  [ChainId.HEDERA_MAINNET]: useDummyPoolTVL,
  [ChainId.NEAR_MAINNET]: useDummyPoolTVL,
  [ChainId.NEAR_TESTNET]: useDummyPoolTVL,
  [ChainId.COSTON2]: useDummyPoolTVL,
  [ChainId.EVMOS_TESTNET]: useDummyPoolTVL,
  [ChainId.EVMOS_MAINNET]: useDummyPoolTVL,
  [ChainId.ETHEREUM]: useDummyPoolTVL,
  [ChainId.POLYGON]: useDummyPoolTVL,
  [ChainId.FANTOM]: useDummyPoolTVL,
  [ChainId.XDAI]: useDummyPoolTVL,
  [ChainId.BSC]: useDummyPoolTVL,
  [ChainId.ARBITRUM]: useDummyPoolTVL,
  [ChainId.CELO]: useDummyPoolTVL,
  [ChainId.OKXCHAIN]: useDummyPoolTVL,
  [ChainId.VELAS]: useDummyPoolTVL,
  [ChainId.AURORA]: useDummyPoolTVL,
  [ChainId.CRONOS]: useDummyPoolTVL,
  [ChainId.FUSE]: useDummyPoolTVL,
  [ChainId.MOONRIVER]: useDummyPoolTVL,
  [ChainId.MOONBEAM]: useDummyPoolTVL,
  [ChainId.OP]: useDummyPoolTVL,
};

export type UseFeeTierDistributionHookType = {
  [chainId in ChainId]: typeof useFeeTierDistribution | typeof useDummyFeeTierDistribution;
};

export const useFeeTierDistributionHook: UseFeeTierDistributionHookType = {
  [ChainId.FUJI]: useFeeTierDistribution,
  [ChainId.AVALANCHE]: useDummyFeeTierDistribution,
  [ChainId.WAGMI]: useDummyFeeTierDistribution,
  [ChainId.COSTON]: useDummyFeeTierDistribution,
  [ChainId.SONGBIRD]: useDummyFeeTierDistribution,
  [ChainId.FLARE_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.HEDERA_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.HEDERA_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.NEAR_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.NEAR_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.COSTON2]: useDummyFeeTierDistribution,
  [ChainId.EVMOS_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.EVMOS_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.ETHEREUM]: useDummyFeeTierDistribution,
  [ChainId.POLYGON]: useDummyFeeTierDistribution,
  [ChainId.FANTOM]: useDummyFeeTierDistribution,
  [ChainId.XDAI]: useDummyFeeTierDistribution,
  [ChainId.BSC]: useDummyFeeTierDistribution,
  [ChainId.ARBITRUM]: useDummyFeeTierDistribution,
  [ChainId.CELO]: useDummyFeeTierDistribution,
  [ChainId.OKXCHAIN]: useDummyFeeTierDistribution,
  [ChainId.VELAS]: useDummyFeeTierDistribution,
  [ChainId.AURORA]: useDummyFeeTierDistribution,
  [ChainId.CRONOS]: useDummyFeeTierDistribution,
  [ChainId.FUSE]: useDummyFeeTierDistribution,
  [ChainId.MOONRIVER]: useDummyFeeTierDistribution,
  [ChainId.MOONBEAM]: useDummyFeeTierDistribution,
  [ChainId.OP]: useDummyFeeTierDistribution,
};
