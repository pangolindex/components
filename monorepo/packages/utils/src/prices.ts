import { CurrencyAmount, ElixirTrade, Trade } from '@pangolindex/sdk';
import { Field } from '../state/pswap/atom';
import { basisPointsToPercent } from './index';

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | ElixirTrade | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage);
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  };
}
