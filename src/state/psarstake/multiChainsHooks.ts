import { ChainId } from '@pangolindex/sdk';
import { useHederaSarPositions } from './hederaHooks';
import { useSarPositions } from './hooks';
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
