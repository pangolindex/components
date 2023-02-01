import { CurrencyAmount, JSBI } from '@pangolindex/sdk';
import { ONE_FRACTION, PANGOCHEF_COMPOUND_SLIPPAGE } from 'src/constants';

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
