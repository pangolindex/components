import { ChainId } from '@pangolindex/sdk';
import { useDummyConcentratedPositionsFromTokenIds, useDummyGetUserPositions } from './dummy';
import { useConcentratedAddLiquidity, useConcentratedPositionsFromTokenIds, useGetUserPositions } from './evm';

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
  [ChainId.EVMOS_TESTNET]: useDummyGetUserPositions,
  [ChainId.EVMOS_MAINNET]: useDummyGetUserPositions,
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

export type UseConcentratedPositionsFromTokenIdsHookType = {
  [chainId in ChainId]: typeof useConcentratedPositionsFromTokenIds | typeof useDummyConcentratedPositionsFromTokenIds;
};

export const useConcentratedPositionsFromTokenIdsHook: UseConcentratedPositionsFromTokenIdsHookType = {
  [ChainId.FUJI]: useConcentratedPositionsFromTokenIds,
  [ChainId.AVALANCHE]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.WAGMI]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.COSTON]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.SONGBIRD]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.FLARE_MAINNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.HEDERA_TESTNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.HEDERA_MAINNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.NEAR_MAINNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.NEAR_TESTNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.COSTON2]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.EVMOS_TESTNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.EVMOS_MAINNET]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.ETHEREUM]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.POLYGON]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.FANTOM]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.XDAI]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.BSC]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.ARBITRUM]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.CELO]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.OKXCHAIN]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.VELAS]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.AURORA]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.CRONOS]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.FUSE]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.MOONRIVER]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.MOONBEAM]: useDummyConcentratedPositionsFromTokenIds,
  [ChainId.OP]: useDummyConcentratedPositionsFromTokenIds,
};

export type UseConcAddLiquidityHookType = {
  [chainId in ChainId]: typeof useConcentratedAddLiquidity;
};

export const useConcentratedAddLiquidityHook: UseConcAddLiquidityHookType = {
  [ChainId.FUJI]: useConcentratedAddLiquidity,
  [ChainId.AVALANCHE]: useConcentratedAddLiquidity,
  [ChainId.WAGMI]: useConcentratedAddLiquidity,
  [ChainId.COSTON]: useConcentratedAddLiquidity,
  [ChainId.SONGBIRD]: useConcentratedAddLiquidity,
  [ChainId.FLARE_MAINNET]: useConcentratedAddLiquidity,
  [ChainId.HEDERA_TESTNET]: useConcentratedAddLiquidity,
  [ChainId.HEDERA_MAINNET]: useConcentratedAddLiquidity,
  [ChainId.NEAR_MAINNET]: useConcentratedAddLiquidity,
  [ChainId.NEAR_TESTNET]: useConcentratedAddLiquidity,
  [ChainId.COSTON2]: useConcentratedAddLiquidity,
  [ChainId.EVMOS_TESTNET]: useConcentratedAddLiquidity,
  [ChainId.EVMOS_MAINNET]: useConcentratedAddLiquidity,
  [ChainId.ETHEREUM]: useConcentratedAddLiquidity,
  [ChainId.POLYGON]: useConcentratedAddLiquidity,
  [ChainId.FANTOM]: useConcentratedAddLiquidity,
  [ChainId.XDAI]: useConcentratedAddLiquidity,
  [ChainId.BSC]: useConcentratedAddLiquidity,
  [ChainId.ARBITRUM]: useConcentratedAddLiquidity,
  [ChainId.CELO]: useConcentratedAddLiquidity,
  [ChainId.OKXCHAIN]: useConcentratedAddLiquidity,
  [ChainId.VELAS]: useConcentratedAddLiquidity,
  [ChainId.AURORA]: useConcentratedAddLiquidity,
  [ChainId.CRONOS]: useConcentratedAddLiquidity,
  [ChainId.FUSE]: useConcentratedAddLiquidity,
  [ChainId.MOONRIVER]: useConcentratedAddLiquidity,
  [ChainId.MOONBEAM]: useConcentratedAddLiquidity,
  [ChainId.OP]: useConcentratedAddLiquidity,
};
