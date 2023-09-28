import { ChainId } from '@pangolindex/sdk';
import {
  useDummyConcLiqPositionFees,
  useDummyPools,
  useDummyPositionTokenURI,
  useDummyUnderlyingTokens,
} from './dummy';
import {
  useConcLiqPositionFees,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePoolsViaSubgraph,
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
