import { BigNumber } from '@ethersproject/bignumber';
import { Price } from '@pangolindex/sdk';
import { MinichefStakingInfo } from '../pstake/types';

export enum PoolType {
  UNSET_POOL,
  ERC20_POOL,
  RELAYER_POOL,
}

export interface ValueVariables {
  balance: BigNumber;
  sumOfEntryTimes: BigNumber;
}

export interface RewardSummations {
  idealPosition: BigNumber;
  rewardPerValue: BigNumber;
}

export interface UserInfo {
  valueVariables: ValueVariables;
  rewardSummations: RewardSummations;
  previousValues: BigNumber;
  lockCount: number | undefined;
}

export interface Pool {
  tokenOrRecipient: string;
  poolType: PoolType;
  rewarder: string;
  rewardPair: string;
  valueVariables: ValueVariables;
  rewardSummations: RewardSummations;
}

export interface PangoChefInfo extends MinichefStakingInfo {
  valueVariables: ValueVariables;
  userValueVariables: ValueVariables;
  userRewardRate: BigNumber;
  pairPrice: Price;
  poolType: PoolType;
  poolRewardRate: BigNumber;
  lockCount: number | undefined;
}

/* Pangochef Subgraph */

export interface PangoChefSubgraphInfo {
  id: string;
  farms: PangoChefFarm[];
}

export interface PangoChefFarm {
  id: string;
  pid: string;
  tvl: string;
  tokenOrRecipientAddress: string;
  rewarder: PangochefFarmRewarder;
  pair: PangochefPair;
}

export interface PangochefFarmRewarder {
  id: string;
  rewards: PangochefFarmReward[];
}

export interface PangochefFarmReward {
  id: string;
  token: PangochefToken;
  multiplier: string;
}

export interface PangochefToken {
  id: string;
  symbol: string;
  derivedUSD: string;
  derivedETH: string;
  name: string;
  decimals: string;
}

export interface PangochefPair {
  id: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  token0: PangochefToken;
  token1: PangochefToken;
}
