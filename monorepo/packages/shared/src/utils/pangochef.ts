import { BigNumber } from 'ethers';
import { BIGNUMBER_ZERO } from 'src/constants';

export interface ValueVariables {
  balance: BigNumber;
  sumOfEntryTimes: BigNumber;
}

export function calculateUserRewardRate(
  userValueVariables: ValueVariables | undefined,
  poolValueVariables: ValueVariables | undefined,
  poolRewardRate: BigNumber | undefined,
  blockTime?: number,
) {
  if (!blockTime) {
    return BIGNUMBER_ZERO;
  }

  const userBalance = userValueVariables?.balance ?? BIGNUMBER_ZERO;
  const userSumOfEntryTimes = userValueVariables?.sumOfEntryTimes ?? BIGNUMBER_ZERO;

  const poolBalance = poolValueVariables?.balance ?? BIGNUMBER_ZERO;
  const poolSumOfEntryTimes = poolValueVariables?.sumOfEntryTimes ?? BIGNUMBER_ZERO;

  if (userBalance.isZero() || poolBalance.isZero()) {
    return BIGNUMBER_ZERO;
  }

  const blockTimestamp = BigNumber.from(blockTime.toString());
  const userValue = blockTimestamp.mul(userBalance).sub(userSumOfEntryTimes);
  const poolValue = blockTimestamp.mul(poolBalance).sub(poolSumOfEntryTimes);

  const _poolRewardRate = poolRewardRate ?? BIGNUMBER_ZERO;

  return userValue.lte(0) || poolValue.lte(0) ? BIGNUMBER_ZERO : _poolRewardRate.mul(userValue).div(poolValue);
}
