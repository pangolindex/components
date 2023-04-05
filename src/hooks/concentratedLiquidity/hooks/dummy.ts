import { ConcentratedPool } from '@pangolindex/sdk';
import { PoolState } from './types';

export function useDummyPools() {
  return [[PoolState.NOT_EXISTS, null]] as [PoolState, ConcentratedPool | null][];
}

export function useDummyPoolTVL() {
  return {
    isLoading: false,
    error: null,
  };
}

export function useDummyFeeTierDistribution() {
  return {
    isLoading: false,
    isError: false,
    largestUsageFeeTier: undefined,
    distributions: undefined,
  };
}
