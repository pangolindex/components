import { FeeAmount, JSBI } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';

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

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tick: number;
  liquidityActive: JSBI;
  liquidityNet: JSBI;
  price0: string;
}

export type TokenId = number | JSBI | BigNumber;

export type UsePositionTokenURIResult = {
  valid: boolean;
  loading: boolean;
  result?: {
    name: string;
    description: string;
    image: string;
  };
  error?: Error;
};
