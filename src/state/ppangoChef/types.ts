import { BigNumber } from '@ethersproject/bignumber';
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
}
