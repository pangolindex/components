import { ElixirPool } from '@pangolindex/sdk';
import { PoolState, UsePositionTokenURIResult } from './types';

export function useDummyPools() {
  return [[PoolState.NOT_EXISTS, null]] as [PoolState, ElixirPool | null][];
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

export function useDummyUnderlyingTokens() {
  return [undefined, undefined];
}

export function useDummyConcLiqPositionFees() {
  return [undefined, undefined];
}

export function useDummyPositionTokenURI(): UsePositionTokenURIResult {
  return {
    valid: false,
    loading: false,
    result: undefined,
    error: undefined,
  };
}
