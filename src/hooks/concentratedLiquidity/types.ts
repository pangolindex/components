import { FeeAmount } from '@pangolindex/sdk';

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export interface FeeTierDistribution {
  isLoading: boolean;
  isError: boolean;
  largestUsageFeeTier?: FeeAmount;

  // distributions as percentages of overall liquidity
  distributions?: Record<FeeAmount, number | undefined>;
}
