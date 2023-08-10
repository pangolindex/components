import { CurrencyAmount, ElixirTrade, Fraction, JSBI, Percent, Pool, TokenAmount, Trade } from '@pangolindex/sdk';
import { useChainId } from '@pangolindex/shared';
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from 'src/constants';

const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(1000), JSBI.BigInt(1000));
//TODO Seperate 2 function
// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: Trade | ElixirTrade): {
  priceImpactWithoutFee?: Percent;
  realizedLPFee?: Percent;
  realizedLPFeeAmount?: CurrencyAmount;
  daasFeeAmount?: CurrencyAmount;
} {
  const chainId = useChainId();
  // for each hop in our trade, take away the x*y=k price impact from swap fees
  // the following example assumes swap fees of 0.3% but this is determined by the pair
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee =
    !trade || trade instanceof ElixirTrade
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
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient, chainId));

  const feeAmount =
    !trade || trade instanceof ElixirTrade
      ? undefined
      : trade.outputAmount instanceof TokenAmount
      ? new TokenAmount(trade.outputAmount.token, trade.fee.multiply(trade.outputAmount.raw).quotient)
      : CurrencyAmount.ether(trade.fee.multiply(trade.outputAmount.raw).quotient, chainId);

  return {
    // for elixir trade we already have priceImpact from trade
    priceImpactWithoutFee: trade instanceof ElixirTrade ? trade.priceImpact : priceImpactWithoutFeePercent,
    realizedLPFee,
    realizedLPFeeAmount,
    daasFeeAmount: feeAmount,
  };
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact) return 0;
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4;
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3;
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2;
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1;
  return 0;
}
