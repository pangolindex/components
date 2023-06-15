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
  [ChainId.AVALANCHE]: usePoolsViaSubgraph,
  [ChainId.WAGMI]: useDummyPools,
  [ChainId.COSTON]: useDummyPools,
  [ChainId.SONGBIRD]: useDummyPools,
  [ChainId.FLARE_MAINNET]: useDummyPools,
  [ChainId.HEDERA_TESTNET]: useDummyPools,
  [ChainId.HEDERA_MAINNET]: useDummyPools,
  [ChainId.NEAR_MAINNET]: useDummyPools,
  [ChainId.NEAR_TESTNET]: useDummyPools,
  [ChainId.COSTON2]: useDummyPools,
  [ChainId.EVMOS_TESTNET]: usePoolsViaSubgraph,
  [ChainId.EVMOS_MAINNET]: usePoolsViaSubgraph,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePoolsViaContract, //TODO:
};

export type UsePoolTVLHookType = {
  [chainId in ChainId]: typeof usePoolTVL | typeof useDummyPoolTVL;
};

export const usePoolTVLHook: UsePoolTVLHookType = {
  [ChainId.FUJI]: usePoolTVL,
  [ChainId.AVALANCHE]: usePoolTVL,
  [ChainId.WAGMI]: useDummyPoolTVL,
  [ChainId.COSTON]: useDummyPoolTVL,
  [ChainId.SONGBIRD]: useDummyPoolTVL,
  [ChainId.FLARE_MAINNET]: useDummyPoolTVL,
  [ChainId.HEDERA_TESTNET]: useDummyPoolTVL,
  [ChainId.HEDERA_MAINNET]: useDummyPoolTVL,
  [ChainId.NEAR_MAINNET]: useDummyPoolTVL,
  [ChainId.NEAR_TESTNET]: useDummyPoolTVL,
  [ChainId.COSTON2]: useDummyPoolTVL,
  [ChainId.EVMOS_TESTNET]: usePoolTVL,
  [ChainId.EVMOS_MAINNET]: usePoolTVL,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePoolTVL,
};

export type UseFeeTierDistributionHookType = {
  [chainId in ChainId]: typeof useFeeTierDistribution | typeof useDummyFeeTierDistribution;
};

export const useFeeTierDistributionHook: UseFeeTierDistributionHookType = {
  [ChainId.FUJI]: useFeeTierDistribution,
  [ChainId.AVALANCHE]: useFeeTierDistribution,
  [ChainId.WAGMI]: useDummyFeeTierDistribution,
  [ChainId.COSTON]: useDummyFeeTierDistribution,
  [ChainId.SONGBIRD]: useDummyFeeTierDistribution,
  [ChainId.FLARE_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.HEDERA_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.HEDERA_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.NEAR_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.NEAR_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.COSTON2]: useDummyFeeTierDistribution,
  [ChainId.EVMOS_TESTNET]: useFeeTierDistribution,
  [ChainId.EVMOS_MAINNET]: useFeeTierDistribution,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useFeeTierDistribution,
};

export type UseUnderlyingTokensHookType = {
  [chainId in ChainId]: typeof useUnderlyingTokens | typeof useDummyUnderlyingTokens;
};

export const useUnderlyingTokensHook: UseUnderlyingTokensHookType = {
  [ChainId.FUJI]: useUnderlyingTokens,
  [ChainId.AVALANCHE]: useUnderlyingTokens,
  [ChainId.WAGMI]: useDummyUnderlyingTokens,
  [ChainId.COSTON]: useDummyUnderlyingTokens,
  [ChainId.SONGBIRD]: useDummyUnderlyingTokens,
  [ChainId.FLARE_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.HEDERA_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.HEDERA_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.NEAR_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.NEAR_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.COSTON2]: useDummyUnderlyingTokens,
  [ChainId.EVMOS_TESTNET]: useUnderlyingTokens,
  [ChainId.EVMOS_MAINNET]: useUnderlyingTokens,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useUnderlyingTokens,
};

export type UseConcLiqPositionFeesHookType = {
  [chainId in ChainId]: typeof useConcLiqPositionFees | typeof useDummyConcLiqPositionFees;
};

export const useConcLiqPositionFeesHook: UseConcLiqPositionFeesHookType = {
  [ChainId.FUJI]: useConcLiqPositionFees,
  [ChainId.AVALANCHE]: useConcLiqPositionFees,
  [ChainId.WAGMI]: useDummyConcLiqPositionFees,
  [ChainId.COSTON]: useDummyConcLiqPositionFees,
  [ChainId.SONGBIRD]: useDummyConcLiqPositionFees,
  [ChainId.FLARE_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.HEDERA_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.HEDERA_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.NEAR_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.NEAR_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.COSTON2]: useDummyConcLiqPositionFees,
  [ChainId.EVMOS_TESTNET]: useConcLiqPositionFees,
  [ChainId.EVMOS_MAINNET]: useConcLiqPositionFees,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useConcLiqPositionFees,
};

export type UsePositionTokenURIHookType = {
  [chainId in ChainId]: typeof usePositionTokenURI | typeof useDummyPositionTokenURI;
};

export const usePositionTokenURIHook: UsePositionTokenURIHookType = {
  [ChainId.FUJI]: usePositionTokenURI,
  [ChainId.AVALANCHE]: usePositionTokenURI,
  [ChainId.WAGMI]: useDummyPositionTokenURI,
  [ChainId.COSTON]: useDummyPositionTokenURI,
  [ChainId.SONGBIRD]: useDummyPositionTokenURI,
  [ChainId.FLARE_MAINNET]: useDummyPositionTokenURI,
  [ChainId.HEDERA_TESTNET]: useDummyPositionTokenURI,
  [ChainId.HEDERA_MAINNET]: useDummyPositionTokenURI,
  [ChainId.NEAR_MAINNET]: useDummyPositionTokenURI,
  [ChainId.NEAR_TESTNET]: useDummyPositionTokenURI,
  [ChainId.COSTON2]: useDummyPositionTokenURI,
  [ChainId.EVMOS_TESTNET]: usePositionTokenURI,
  [ChainId.EVMOS_MAINNET]: usePositionTokenURI,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePositionTokenURI,
};
