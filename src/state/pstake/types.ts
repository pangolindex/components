import { JSBI, Token, TokenAmount } from '@pangolindex/sdk';

export enum SpaceType {
  card = 'card',
  detail = 'detail',
}

export enum PoolType {
  own = 'own',
  all = 'all',
  superFarms = 'superFarms',
}

export interface StakingInfoBase {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRatePerSecond: TokenAmount;
  totalRewardRatePerWeek: TokenAmount;
  // the current amount of token distributed to the active account per week.
  // equivalent to percent of total supply * reward rate * (60 * 60 * 24 * 7)
  rewardRatePerWeek: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;
  // has the reward period expired
  isPeriodFinished: boolean;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalWeeklyRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRatePerSecond: TokenAmount,
  ) => TokenAmount;
}

export interface SingleSideStakingInfo extends StakingInfoBase {
  // the token being earned
  rewardToken: Token;
  // total staked PNG in the pool
  totalStakedInPng: TokenAmount;
  apr: JSBI;
}

export interface DoubleSideStakingInfo extends StakingInfoBase {
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the pool weight
  multiplier: JSBI;
  // total staked AVAX in the pool
  totalStakedInWavax: TokenAmount;
  totalStakedInUsd: TokenAmount;
  // array of addresses of extra reward tokens
  rewardTokensAddress?: Array<string>;
  // address of the rewarder contract (used to add extra tokens as rewards for farm)
  rewardsAddress?: string;
  // extra reward tokens multipliers
  rewardTokensMultiplier?: Array<JSBI>;
  getExtraTokensWeeklyRewardRate?: (
    rewardRatePerWeek: TokenAmount,
    token: Token,
    tokenMultiplier: JSBI | undefined,
  ) => TokenAmount;

  // apr from swap fees
  swapFeeApr?: number;
  // apr from rewards
  stakingApr?: number;
  // swapFeeApr + stakingApr
  combinedApr?: number;
}

export interface MinichefStakingInfo extends DoubleSideStakingInfo {
  // array of extra reward tokens (super farms)
  rewardTokens?: Array<Token>;
  // pair address
  pairAddress?: string;
  // farm id
  pid: string;
  // array of extra pending rewards (super farms)
  extraPendingRewards: JSBI[];
}

export interface DoubleSideStaking {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  version: number;
  multiplier?: number;
}

export interface MinichefToken {
  id: string;
  symbol: string;
  derivedUSD: number;
  derivedETH: string;
  name: string;
  decimals: number;
}

export interface MinichefPair {
  id: string;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  token0: MinichefToken;
  token1: MinichefToken;
}

export interface MinichefFarmReward {
  id: string;
  token: MinichefToken;
  multiplier: number;
}

export interface MinichefFarmRewarder {
  id: string;
  rewards: Array<MinichefFarmReward>;
}

export interface FarmingPositions {
  id: string;
  stakedTokenBalance: number;
}

export interface MinichefFarm {
  id: string;
  pid: string;
  tvl: number;
  allocPoint: number;
  rewarderAddress: string;
  chefAddress: string;
  pairAddress: string;
  rewarder: MinichefFarmRewarder;
  pair: MinichefPair;
  farmingPositions: FarmingPositions[];
  earnedAmount?: number;
  swapFeeApr?: number;
  stakingApr?: number;
  combinedApr?: number;
}

export interface MinichefV2 {
  id: string;
  totalAllocPoint: number;
  rewardPerSecond: number;
  rewardsExpiration: number;
  farms: Array<MinichefFarm>;
}
