import { ChainId } from '@pangolindex/sdk';
import { useDummyDerivativeSarStake, useDummySarPositions } from './dummyHooks';
import { useDerivativeHederaSarStake, useHederaSarPositions } from './hederaHooks';
import { useDerivativeSarStake, useSarPositions } from './hooks';

export type useSarPositionsType = {
  [chainId in ChainId]: typeof useSarPositions;
};

export type useDerivativeSarStakeType = {
  [chainId in ChainId]: typeof useDerivativeSarStake;
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
