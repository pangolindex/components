import { BigNumber } from '@ethersproject/bignumber';
import { CurrencyAmount, JSBI } from '@pangolindex/sdk';
import { BIGNUMBER_ZERO, ONE_FRACTION, PANGOCHEF_COMPOUND_SLIPPAGE } from 'src/constants';
import { ValueVariables } from './types';

/**
 * This function calculates the minimum and maximum value of the slippage used in the pangochef compound
 * @param amount The value to be calculated the slippage
 * @returns The object where **minPairAmount** is the slippage minimum and **maxPairAmount** is the slippage maximum
 */
export function calculateCompoundSlippage(amount: CurrencyAmount) {
  const _minPairAmount = ONE_FRACTION.subtract(PANGOCHEF_COMPOUND_SLIPPAGE).multiply(amount.raw);
  // we need to do this to fix the possible division by 0 error in .toFixed() function
  const minPairAmount = JSBI.BigInt(_minPairAmount.equalTo('0') ? '0' : _minPairAmount.toFixed(0));

  const _maxPairAmount = ONE_FRACTION.add(PANGOCHEF_COMPOUND_SLIPPAGE).multiply(amount.raw);
  const maxPairAmount = JSBI.BigInt(_maxPairAmount.equalTo('0') ? '0' : _maxPairAmount.toFixed(0));

  // the minPairAmount and maxPairAmount is amount of other token/currency to sent to compound with slippage tolerance
  const slippage = {
    minPairAmount: JSBI.lessThan(minPairAmount, JSBI.BigInt(0)) ? '0x0' : `0x${minPairAmount.toString(16)}`,
    maxPairAmount: `0x${maxPairAmount.toString(16)}`,
  };

  return slippage;
}

export function calculateUserRewardRate(
  userValueVariables: ValueVariables,
  poolValueVariables: ValueVariables,
  poolRewardRate: BigNumber,
  blockTime?: number,
): BigNumber {
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
