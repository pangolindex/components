import { ChainId } from '@pangolindex/sdk';
import { useDerivativeHederaSarStake, useHederaSarPositions } from './hederaHooks';
import { useDerivativeSarStake, useSarPositions } from './hooks';
import { Position } from './types';

export function useDummySarPositions(): {
  positions: Position[];
  isLoading: boolean;
} {
  return {
    positions: [] as Position[],
    isLoading: false,
  };
}

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
};

export const useDerivativeSarStakeHook: useDerivativeSarStakeType = {
  [ChainId.FUJI]: useDerivativeSarStake,
  [ChainId.AVALANCHE]: useDerivativeSarStake,
  [ChainId.WAGMI]: useDerivativeSarStake,
  [ChainId.COSTON]: useDerivativeSarStake,
  [ChainId.SONGBIRD]: useDerivativeSarStake,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarStake,
  [ChainId.NEAR_MAINNET]: useDerivativeSarStake,
  [ChainId.NEAR_TESTNET]: useDerivativeSarStake,
};
