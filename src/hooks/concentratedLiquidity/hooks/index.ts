import { ChainId } from '@pangolindex/sdk';
import {
  useDummyConcLiqPositionFees,
  useDummyFeeTierDistribution,
  useDummyPoolTVL,
  useDummyPools,
  useDummyPositionTokenURI,
  useDummyUnderlyingTokens,
} from './dummy';
import {
  useConcLiqPositionFees,
  useFeeTierDistribution,
  usePoolTVL,
  usePoolsViaContract,
  usePoolsViaSubgraph,
  usePositionTokenURI,
  useUnderlyingTokens,
} from './evm';

export type UsePoolsHookType = {
  [chainId in ChainId]: typeof usePoolsViaContract | typeof useDummyPools;
};

export const usePoolsHook: UsePoolsHookType = {
  [ChainId.FUJI]: usePoolsViaSubgraph,
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

export type UseUnderlyingTokensHookType = {
  [chainId in ChainId]: typeof useUnderlyingTokens | typeof useDummyUnderlyingTokens;
};

export const useUnderlyingTokensHook: UseUnderlyingTokensHookType = {
  [ChainId.FUJI]: useUnderlyingTokens,
  [ChainId.AVALANCHE]: useDummyUnderlyingTokens,
  [ChainId.WAGMI]: useDummyUnderlyingTokens,
  [ChainId.COSTON]: useDummyUnderlyingTokens,
  [ChainId.SONGBIRD]: useDummyUnderlyingTokens,
  [ChainId.FLARE_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.HEDERA_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.HEDERA_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.NEAR_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.NEAR_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.COSTON2]: useDummyUnderlyingTokens,
  [ChainId.EVMOS_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.EVMOS_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.ETHEREUM]: useDummyUnderlyingTokens,
  [ChainId.POLYGON]: useDummyUnderlyingTokens,
  [ChainId.FANTOM]: useDummyUnderlyingTokens,
  [ChainId.XDAI]: useDummyUnderlyingTokens,
  [ChainId.BSC]: useDummyUnderlyingTokens,
  [ChainId.ARBITRUM]: useDummyUnderlyingTokens,
  [ChainId.CELO]: useDummyUnderlyingTokens,
  [ChainId.OKXCHAIN]: useDummyUnderlyingTokens,
  [ChainId.VELAS]: useDummyUnderlyingTokens,
  [ChainId.AURORA]: useDummyUnderlyingTokens,
  [ChainId.CRONOS]: useDummyUnderlyingTokens,
  [ChainId.FUSE]: useDummyUnderlyingTokens,
  [ChainId.MOONRIVER]: useDummyUnderlyingTokens,
  [ChainId.MOONBEAM]: useDummyUnderlyingTokens,
  [ChainId.OP]: useDummyUnderlyingTokens,
};

export type UseConcLiqPositionFeesHookType = {
  [chainId in ChainId]: typeof useConcLiqPositionFees | typeof useDummyConcLiqPositionFees;
};

export const useConcLiqPositionFeesHook: UseConcLiqPositionFeesHookType = {
  [ChainId.FUJI]: useConcLiqPositionFees,
  [ChainId.AVALANCHE]: useDummyConcLiqPositionFees,
  [ChainId.WAGMI]: useDummyConcLiqPositionFees,
  [ChainId.COSTON]: useDummyConcLiqPositionFees,
  [ChainId.SONGBIRD]: useDummyConcLiqPositionFees,
  [ChainId.FLARE_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.HEDERA_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.HEDERA_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.NEAR_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.NEAR_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.COSTON2]: useDummyConcLiqPositionFees,
  [ChainId.EVMOS_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.EVMOS_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.ETHEREUM]: useDummyConcLiqPositionFees,
  [ChainId.POLYGON]: useDummyConcLiqPositionFees,
  [ChainId.FANTOM]: useDummyConcLiqPositionFees,
  [ChainId.XDAI]: useDummyConcLiqPositionFees,
  [ChainId.BSC]: useDummyConcLiqPositionFees,
  [ChainId.ARBITRUM]: useDummyConcLiqPositionFees,
  [ChainId.CELO]: useDummyConcLiqPositionFees,
  [ChainId.OKXCHAIN]: useDummyConcLiqPositionFees,
  [ChainId.VELAS]: useDummyConcLiqPositionFees,
  [ChainId.AURORA]: useDummyConcLiqPositionFees,
  [ChainId.CRONOS]: useDummyConcLiqPositionFees,
  [ChainId.FUSE]: useDummyConcLiqPositionFees,
  [ChainId.MOONRIVER]: useDummyConcLiqPositionFees,
  [ChainId.MOONBEAM]: useDummyConcLiqPositionFees,
  [ChainId.OP]: useDummyConcLiqPositionFees,
};

export type UsePositionTokenURIHookType = {
  [chainId in ChainId]: typeof usePositionTokenURI | typeof useDummyPositionTokenURI;
};

export const usePositionTokenURIHook: UsePositionTokenURIHookType = {
  [ChainId.FUJI]: usePositionTokenURI,
  [ChainId.AVALANCHE]: useDummyPositionTokenURI,
  [ChainId.WAGMI]: useDummyPositionTokenURI,
  [ChainId.COSTON]: useDummyPositionTokenURI,
  [ChainId.SONGBIRD]: useDummyPositionTokenURI,
  [ChainId.FLARE_MAINNET]: useDummyPositionTokenURI,
  [ChainId.HEDERA_TESTNET]: useDummyPositionTokenURI,
  [ChainId.HEDERA_MAINNET]: useDummyPositionTokenURI,
  [ChainId.NEAR_MAINNET]: useDummyPositionTokenURI,
  [ChainId.NEAR_TESTNET]: useDummyPositionTokenURI,
  [ChainId.COSTON2]: useDummyPositionTokenURI,
  [ChainId.EVMOS_TESTNET]: useDummyPositionTokenURI,
  [ChainId.EVMOS_MAINNET]: useDummyPositionTokenURI,
  [ChainId.ETHEREUM]: useDummyPositionTokenURI,
  [ChainId.POLYGON]: useDummyPositionTokenURI,
  [ChainId.FANTOM]: useDummyPositionTokenURI,
  [ChainId.XDAI]: useDummyPositionTokenURI,
  [ChainId.BSC]: useDummyPositionTokenURI,
  [ChainId.ARBITRUM]: useDummyPositionTokenURI,
  [ChainId.CELO]: useDummyPositionTokenURI,
  [ChainId.OKXCHAIN]: useDummyPositionTokenURI,
  [ChainId.VELAS]: useDummyPositionTokenURI,
  [ChainId.AURORA]: useDummyPositionTokenURI,
  [ChainId.CRONOS]: useDummyPositionTokenURI,
  [ChainId.FUSE]: useDummyPositionTokenURI,
  [ChainId.MOONRIVER]: useDummyPositionTokenURI,
  [ChainId.MOONBEAM]: useDummyPositionTokenURI,
  [ChainId.OP]: useDummyPositionTokenURI,
};
