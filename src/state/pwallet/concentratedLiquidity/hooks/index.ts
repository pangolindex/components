import { ChainId } from '@pangolindex/sdk';
import { useDummyElixirPositionsFromTokenIds, useDummyGetUserPositions } from './dummy';
import {
  useElixirAddLiquidity,
  useElixirCollectEarnedFees,
  useElixirPositionsFromTokenIds,
  useGetUserPositions,
} from './evm';

export type UseGetUserPositionsHookType = {
  [chainId in ChainId]: typeof useGetUserPositions | typeof useDummyGetUserPositions;
};

export const useGetUserPositionsHook: UseGetUserPositionsHookType = {
  [ChainId.FUJI]: useGetUserPositions,
  [ChainId.AVALANCHE]: useDummyGetUserPositions,
  [ChainId.WAGMI]: useDummyGetUserPositions,
  [ChainId.COSTON]: useDummyGetUserPositions,
  [ChainId.SONGBIRD]: useDummyGetUserPositions,
  [ChainId.FLARE_MAINNET]: useDummyGetUserPositions,
  [ChainId.HEDERA_TESTNET]: useDummyGetUserPositions,
  [ChainId.HEDERA_MAINNET]: useDummyGetUserPositions,
  [ChainId.NEAR_MAINNET]: useDummyGetUserPositions,
  [ChainId.NEAR_TESTNET]: useDummyGetUserPositions,
  [ChainId.COSTON2]: useDummyGetUserPositions,
  [ChainId.EVMOS_TESTNET]: useGetUserPositions,
  [ChainId.EVMOS_MAINNET]: useGetUserPositions,
  [ChainId.ETHEREUM]: useDummyGetUserPositions,
  [ChainId.POLYGON]: useDummyGetUserPositions,
  [ChainId.FANTOM]: useDummyGetUserPositions,
  [ChainId.XDAI]: useDummyGetUserPositions,
  [ChainId.BSC]: useDummyGetUserPositions,
  [ChainId.ARBITRUM]: useDummyGetUserPositions,
  [ChainId.CELO]: useDummyGetUserPositions,
  [ChainId.OKXCHAIN]: useDummyGetUserPositions,
  [ChainId.VELAS]: useDummyGetUserPositions,
  [ChainId.AURORA]: useDummyGetUserPositions,
  [ChainId.CRONOS]: useDummyGetUserPositions,
  [ChainId.FUSE]: useDummyGetUserPositions,
  [ChainId.MOONRIVER]: useDummyGetUserPositions,
  [ChainId.MOONBEAM]: useDummyGetUserPositions,
  [ChainId.OP]: useDummyGetUserPositions,
};

export type UseElixirPositionsFromTokenIdsHookType = {
  [chainId in ChainId]: typeof useElixirPositionsFromTokenIds | typeof useDummyElixirPositionsFromTokenIds;
};

export const useElixirPositionsFromTokenIdsHook: UseElixirPositionsFromTokenIdsHookType = {
  [ChainId.FUJI]: useElixirPositionsFromTokenIds,
  [ChainId.AVALANCHE]: useDummyElixirPositionsFromTokenIds,
  [ChainId.WAGMI]: useDummyElixirPositionsFromTokenIds,
  [ChainId.COSTON]: useDummyElixirPositionsFromTokenIds,
  [ChainId.SONGBIRD]: useDummyElixirPositionsFromTokenIds,
  [ChainId.FLARE_MAINNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.HEDERA_TESTNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.HEDERA_MAINNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.NEAR_MAINNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.NEAR_TESTNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.COSTON2]: useDummyElixirPositionsFromTokenIds,
  [ChainId.EVMOS_TESTNET]: useElixirPositionsFromTokenIds,
  [ChainId.EVMOS_MAINNET]: useElixirPositionsFromTokenIds,
  [ChainId.ETHEREUM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.POLYGON]: useDummyElixirPositionsFromTokenIds,
  [ChainId.FANTOM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.XDAI]: useDummyElixirPositionsFromTokenIds,
  [ChainId.BSC]: useDummyElixirPositionsFromTokenIds,
  [ChainId.ARBITRUM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.CELO]: useDummyElixirPositionsFromTokenIds,
  [ChainId.OKXCHAIN]: useDummyElixirPositionsFromTokenIds,
  [ChainId.VELAS]: useDummyElixirPositionsFromTokenIds,
  [ChainId.AURORA]: useDummyElixirPositionsFromTokenIds,
  [ChainId.CRONOS]: useDummyElixirPositionsFromTokenIds,
  [ChainId.FUSE]: useDummyElixirPositionsFromTokenIds,
  [ChainId.MOONRIVER]: useDummyElixirPositionsFromTokenIds,
  [ChainId.MOONBEAM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.OP]: useDummyElixirPositionsFromTokenIds,
};

export type UseElixirAddLiquidityHookType = {
  [chainId in ChainId]: typeof useElixirAddLiquidity;
};

export const useElixirAddLiquidityHook: UseElixirAddLiquidityHookType = {
  [ChainId.FUJI]: useElixirAddLiquidity,
  [ChainId.AVALANCHE]: useElixirAddLiquidity,
  [ChainId.WAGMI]: useElixirAddLiquidity,
  [ChainId.COSTON]: useElixirAddLiquidity,
  [ChainId.SONGBIRD]: useElixirAddLiquidity,
  [ChainId.FLARE_MAINNET]: useElixirAddLiquidity,
  [ChainId.HEDERA_TESTNET]: useElixirAddLiquidity,
  [ChainId.HEDERA_MAINNET]: useElixirAddLiquidity,
  [ChainId.NEAR_MAINNET]: useElixirAddLiquidity,
  [ChainId.NEAR_TESTNET]: useElixirAddLiquidity,
  [ChainId.COSTON2]: useElixirAddLiquidity,
  [ChainId.EVMOS_TESTNET]: useElixirAddLiquidity,
  [ChainId.EVMOS_MAINNET]: useElixirAddLiquidity,
  [ChainId.ETHEREUM]: useElixirAddLiquidity,
  [ChainId.POLYGON]: useElixirAddLiquidity,
  [ChainId.FANTOM]: useElixirAddLiquidity,
  [ChainId.XDAI]: useElixirAddLiquidity,
  [ChainId.BSC]: useElixirAddLiquidity,
  [ChainId.ARBITRUM]: useElixirAddLiquidity,
  [ChainId.CELO]: useElixirAddLiquidity,
  [ChainId.OKXCHAIN]: useElixirAddLiquidity,
  [ChainId.VELAS]: useElixirAddLiquidity,
  [ChainId.AURORA]: useElixirAddLiquidity,
  [ChainId.CRONOS]: useElixirAddLiquidity,
  [ChainId.FUSE]: useElixirAddLiquidity,
  [ChainId.MOONRIVER]: useElixirAddLiquidity,
  [ChainId.MOONBEAM]: useElixirAddLiquidity,
  [ChainId.OP]: useElixirAddLiquidity,
};

export type UseElixirCollectEarnedFeesHookType = {
  [chainId in ChainId]: typeof useElixirCollectEarnedFees;
};

export const useElixirCollectEarnedFeesHook: UseElixirCollectEarnedFeesHookType = {
  [ChainId.FUJI]: useElixirCollectEarnedFees,
  [ChainId.AVALANCHE]: useElixirCollectEarnedFees,
  [ChainId.WAGMI]: useElixirCollectEarnedFees,
  [ChainId.COSTON]: useElixirCollectEarnedFees,
  [ChainId.SONGBIRD]: useElixirCollectEarnedFees,
  [ChainId.FLARE_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.HEDERA_TESTNET]: useElixirCollectEarnedFees,
  [ChainId.HEDERA_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.NEAR_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.NEAR_TESTNET]: useElixirCollectEarnedFees,
  [ChainId.COSTON2]: useElixirCollectEarnedFees,
  [ChainId.EVMOS_TESTNET]: useElixirCollectEarnedFees,
  [ChainId.EVMOS_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.ETHEREUM]: useElixirCollectEarnedFees,
  [ChainId.POLYGON]: useElixirCollectEarnedFees,
  [ChainId.FANTOM]: useElixirCollectEarnedFees,
  [ChainId.XDAI]: useElixirCollectEarnedFees,
  [ChainId.BSC]: useElixirCollectEarnedFees,
  [ChainId.ARBITRUM]: useElixirCollectEarnedFees,
  [ChainId.CELO]: useElixirCollectEarnedFees,
  [ChainId.OKXCHAIN]: useElixirCollectEarnedFees,
  [ChainId.VELAS]: useElixirCollectEarnedFees,
  [ChainId.AURORA]: useElixirCollectEarnedFees,
  [ChainId.CRONOS]: useElixirCollectEarnedFees,
  [ChainId.FUSE]: useElixirCollectEarnedFees,
  [ChainId.MOONRIVER]: useElixirCollectEarnedFees,
  [ChainId.MOONBEAM]: useElixirCollectEarnedFees,
  [ChainId.OP]: useElixirCollectEarnedFees,
};
