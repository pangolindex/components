import { ChainId } from '@pangolindex/sdk';
import { useDummyDerivativeSarStake, useDummyDerivativeSarUnstake, useDummySarPositions } from './dummyHooks';
import { useDerivativeHederaSarStake, useDerivativeHederaSarUnstake, useHederaSarPositions } from './hederaHooks';
import { useDerivativeSarStake, useDerivativeSarUnstake, useSarPositions } from './hooks';

export type useSarPositionsType = {
  [chainId in ChainId]: typeof useSarPositions;
};

export type useDerivativeSarStakeType = {
  [chainId in ChainId]: typeof useDerivativeSarStake;
};

export type useDerivativeSarUnstakeType = {
  [chainId in ChainId]: typeof useDerivativeSarUnstake;
};

export const useSarPositionsHook: useSarPositionsType = {
  [ChainId.FUJI]: useSarPositions,
  [ChainId.AVALANCHE]: useSarPositions,
  [ChainId.WAGMI]: useSarPositions,
  [ChainId.COSTON]: useSarPositions,
  [ChainId.SONGBIRD]: useSarPositions,
  [ChainId.HEDERA_TESTNET]: useHederaSarPositions,
  [ChainId.NEAR_MAINNET]: useDummySarPositions,
  [ChainId.NEAR_TESTNET]: useDummySarPositions,
  [ChainId.ETHEREUM]: useDummySarPositions,
  [ChainId.POLYGON]: useDummySarPositions,
  [ChainId.FANTOM]: useDummySarPositions,
  [ChainId.XDAI]: useDummySarPositions,
  [ChainId.BSC]: useDummySarPositions,
  [ChainId.ARBITRUM]: useDummySarPositions,
  [ChainId.CELO]: useDummySarPositions,
  [ChainId.OKXCHAIN]: useDummySarPositions,
  [ChainId.VELAS]: useDummySarPositions,
  [ChainId.AURORA]: useDummySarPositions,
  [ChainId.CRONOS]: useDummySarPositions,
  [ChainId.FUSE]: useDummySarPositions,
  [ChainId.MOONRIVER]: useDummySarPositions,
  [ChainId.MOONBEAM]: useDummySarPositions,
  [ChainId.OP]: useDummySarPositions,
};

export const useDerivativeSarStakeHook: useDerivativeSarStakeType = {
  [ChainId.FUJI]: useDerivativeSarStake,
  [ChainId.AVALANCHE]: useDerivativeSarStake,
  [ChainId.WAGMI]: useDerivativeSarStake,
  [ChainId.COSTON]: useDerivativeSarStake,
  [ChainId.SONGBIRD]: useDerivativeSarStake,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarStake,
  [ChainId.NEAR_MAINNET]: useDummyDerivativeSarStake,
  [ChainId.NEAR_TESTNET]: useDummyDerivativeSarStake,
  [ChainId.ETHEREUM]: useDummyDerivativeSarStake,
  [ChainId.POLYGON]: useDummyDerivativeSarStake,
  [ChainId.FANTOM]: useDummyDerivativeSarStake,
  [ChainId.XDAI]: useDummyDerivativeSarStake,
  [ChainId.BSC]: useDummyDerivativeSarStake,
  [ChainId.ARBITRUM]: useDummyDerivativeSarStake,
  [ChainId.CELO]: useDummyDerivativeSarStake,
  [ChainId.OKXCHAIN]: useDummyDerivativeSarStake,
  [ChainId.VELAS]: useDummyDerivativeSarStake,
  [ChainId.AURORA]: useDummyDerivativeSarStake,
  [ChainId.CRONOS]: useDummyDerivativeSarStake,
  [ChainId.FUSE]: useDummyDerivativeSarStake,
  [ChainId.MOONRIVER]: useDummyDerivativeSarStake,
  [ChainId.MOONBEAM]: useDummyDerivativeSarStake,
  [ChainId.OP]: useDummyDerivativeSarStake,
};

export const useDerivativeSarUnstakeHook: useDerivativeSarUnstakeType = {
  [ChainId.FUJI]: useDerivativeSarUnstake,
  [ChainId.AVALANCHE]: useDerivativeSarUnstake,
  [ChainId.WAGMI]: useDerivativeSarUnstake,
  [ChainId.COSTON]: useDerivativeSarUnstake,
  [ChainId.SONGBIRD]: useDerivativeSarUnstake,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarUnstake,
  [ChainId.NEAR_MAINNET]: useDummyDerivativeSarUnstake,
  [ChainId.NEAR_TESTNET]: useDummyDerivativeSarUnstake,
  [ChainId.ETHEREUM]: useDummyDerivativeSarUnstake,
  [ChainId.POLYGON]: useDummyDerivativeSarUnstake,
  [ChainId.FANTOM]: useDummyDerivativeSarUnstake,
  [ChainId.XDAI]: useDummyDerivativeSarUnstake,
  [ChainId.BSC]: useDummyDerivativeSarUnstake,
  [ChainId.ARBITRUM]: useDummyDerivativeSarUnstake,
  [ChainId.CELO]: useDummyDerivativeSarUnstake,
  [ChainId.OKXCHAIN]: useDummyDerivativeSarUnstake,
  [ChainId.VELAS]: useDummyDerivativeSarUnstake,
  [ChainId.AURORA]: useDummyDerivativeSarUnstake,
  [ChainId.CRONOS]: useDummyDerivativeSarUnstake,
  [ChainId.FUSE]: useDummyDerivativeSarUnstake,
  [ChainId.MOONRIVER]: useDummyDerivativeSarUnstake,
  [ChainId.MOONBEAM]: useDummyDerivativeSarUnstake,
  [ChainId.OP]: useDummyDerivativeSarUnstake,
};
