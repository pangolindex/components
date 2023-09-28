import { ElixirPool } from '@pangolindex/sdk';
import { PoolState, UsePositionTokenURIResult } from './types';

export function useDummyPools() {
  return [[PoolState.NOT_EXISTS, null]] as [PoolState, ElixirPool | null][];
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
