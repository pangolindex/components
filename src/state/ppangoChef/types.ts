import { BigNumber } from '@ethersproject/bignumber';
import { CurrencyAmount, Price, TokenAmount } from '@pangolindex/sdk';
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

export interface UserInfo {
  valueVariables: ValueVariables;
  previousValues: BigNumber;
  lockCount: number | undefined;
}

export interface Pool {
  tokenOrRecipient: string;
  poolType: PoolType;
  rewarder: string;
  rewardPair: string;
  valueVariables: ValueVariables;
}

export interface PangoChefInfo extends MinichefStakingInfo {
  valueVariables: ValueVariables;
  userValueVariables: ValueVariables;
  userRewardRate: BigNumber;
  pairPrice: Price;
  poolType: PoolType;
  poolRewardRate: BigNumber;
  lockCount: number | undefined;
  userApr: number;
}

export interface WithdrawData {
  version?: number;
  poolId: string | undefined;
  stakedAmount: TokenAmount;
  stakingRewardAddress?: string;
}

export interface PangoChefCompoundData {
  poolId: string | undefined;
  isPNGPool: boolean;
  amountToAdd: CurrencyAmount | TokenAmount;
}
