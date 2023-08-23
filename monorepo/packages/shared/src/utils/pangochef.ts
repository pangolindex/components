import { BigNumber } from 'ethers';
import { BIGNUMBER_ZERO } from 'src/constants';

export interface ValueVariables {
  balance: BigNumber;
  sumOfEntryTimes: BigNumber;
}

export function calculateUserRewardRate(
  userValueVariables: ValueVariables,
  poolValueVariables: ValueVariables,
  poolRewardRate: BigNumber,
  blockTime?: number,
) {
  if (!blockTime) {
    return BIGNUMBER_ZERO;
  }

  const userBalance = userValueVariables.balance || BigNumber.from(0);
  const userSumOfEntryTimes = userValueVariables.sumOfEntryTimes || BigNumber.from(0);

  const poolBalance = poolValueVariables.balance || BigNumber.from(0);
  const poolSumOfEntryTimes = poolValueVariables.sumOfEntryTimes || BigNumber.from(0);

  if (userBalance.isZero() || poolBalance.isZero()) {
    return BIGNUMBER_ZERO;
  }

  const blockTimestamp = BigNumber.from(blockTime.toString());
  const userValue = blockTimestamp.mul(userBalance).sub(userSumOfEntryTimes);
  const poolValue = blockTimestamp.mul(poolBalance).sub(poolSumOfEntryTimes);

  return userValue.lte(0) || poolValue.lte(0) ? BIGNUMBER_ZERO : poolRewardRate?.mul(userValue).div(poolValue);
}
