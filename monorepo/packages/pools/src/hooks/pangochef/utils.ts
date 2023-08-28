import { CurrencyAmount, Fraction, JSBI, Price, Token, TokenAmount } from '@pangolindex/sdk';
import { BIG_INT_SECONDS_IN_WEEK, ONE_FRACTION, PANGOCHEF_COMPOUND_SLIPPAGE } from '@pangolindex/shared';

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

interface CalculateAprArgs {
  pairPrice: Price | Fraction;
  stakedAmount: TokenAmount;
  userRewardRate: Fraction;
  pngPrice: Price;
  png: Token;
}

/**
 * This function calculate the user apr
 *
 * @param pairPrice price of pair in wrapped currency
 * @param stakedAmount total staked of user
 * @param userRewardRate reward rate of user in png/s
 * @param pngPrice price of png in wrappred currency
 * @param png pangolin governace token
 * @returns return the apr of user
 */
export function calculateUserAPR(args: CalculateAprArgs) {
  const { pairPrice, stakedAmount, userRewardRate, pngPrice, png } = args;

  const rawPrice = !(pairPrice instanceof Price) && pairPrice instanceof Fraction ? pairPrice : pairPrice.raw;

  const pairBalance = rawPrice.multiply(stakedAmount);

  //userApr = userRewardRate(POOL_ID, USER_ADDRESS) * 365 days * 100 * PNG_PRICE / ((getUser(POOL_ID, USER_ADDRESS).valueVariables.balance * STAKING_TOKEN_PRICE) * 1e(png.decimals))
  return pairBalance.equalTo('0')
    ? 0
    : Number(
        pngPrice.raw
          .multiply(userRewardRate)
          .multiply((86400 * 365 * 100).toString())
          .divide(pairBalance.multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals))))
          .toFixed(4),
      );
}

export function getHypotheticalWeeklyRewardRate(
  stakedAmount: TokenAmount,
  totalStakedAmount: TokenAmount,
  totalRewardRatePerSecond: TokenAmount,
): TokenAmount {
  const png = totalRewardRatePerSecond?.token;
  return new TokenAmount(
    png,
    JSBI.greaterThan(totalStakedAmount?.raw, JSBI.BigInt(0))
      ? JSBI.divide(
          JSBI.multiply(JSBI.multiply(totalRewardRatePerSecond?.raw, stakedAmount?.raw), BIG_INT_SECONDS_IN_WEEK),
          totalStakedAmount?.raw,
        )
      : JSBI.BigInt(0),
  );
}
