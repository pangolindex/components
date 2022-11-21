import { CurrencyAmount, Fraction, JSBI, Percent, Pool, TokenAmount, Trade } from '@pangolindex/sdk';
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from '../constants';
import { Field } from '../state/pswap/actions';
import { basisPointsToPercent } from './index';

const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(1000), JSBI.BigInt(1000));

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: Trade): {
  priceImpactWithoutFee?: Percent;
  realizedLPFee?: Percent;
  realizedLPFeeAmount?: CurrencyAmount;
  daasFeeAmount?: CurrencyAmount;
} {
  // for each hop in our trade, take away the x*y=k price impact from swap fees
  // the following example assumes swap fees of 0.3% but this is determined by the pair
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pools.reduce<Fraction>(
          (currentFee: Fraction, pool: Pool): Fraction =>
            currentFee.multiply(new Percent(pool.swapFeeCoefficient, pool.swapFeeDivisor)),
          ONE_HUNDRED_PERCENT,
        ),
      );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined;

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined;

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient));

  const feeAmount = !trade
    ? undefined
    : trade.outputAmount instanceof TokenAmount
    ? new TokenAmount(trade.outputAmount.token, trade.fee.multiply(trade.outputAmount.raw).quotient)
    : CurrencyAmount.ether(trade.fee.multiply(trade.outputAmount.raw).quotient);

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee,
    realizedLPFeeAmount,
    daasFeeAmount: feeAmount,
  };
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage);
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  };
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4;
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3;
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2;
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1;
  return 0;
}
