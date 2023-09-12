import { useChainId } from '@honeycomb/shared';
import {
  Currency,
  ElixirPool,
  FeeAmount,
  JSBI,
  Position,
  Price,
  TICK_SPACINGS,
  TickMath,
  Token,
  nearestUsableTick,
} from '@pangolindex/sdk';
import { useMemo } from 'react';
import { usePoolsHook } from 'src/hooks';
import { Bound } from 'src/state/mint/atom';
import { PoolState } from './types';

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): [PoolState, ElixirPool | null] {
  const chainId = useChainId();
  const usePools = usePoolsHook[chainId];

  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  );

  const pools = usePools(poolKeys);

  return pools?.[0];
}

export default function useIsTickAtLimit(
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
) {
  return useMemo(
    () => ({
      [Bound.LOWER]:
        feeAmount && tickLower
          ? tickLower === nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount as FeeAmount])
          : undefined,
      [Bound.UPPER]:
        feeAmount && tickUpper
          ? tickUpper === nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount as FeeAmount])
          : undefined,
    }),
    [feeAmount, tickLower, tickUpper],
  );
}

export function getPriceOrderingFromPositionForUI(position?: Position): {
  priceLower?: Price;
  priceUpper?: Price;
  quote?: Token;
  base?: Token;
} {
  if (!position) {
    return {};
  }

  const token0 = position.amount0.token;
  const token1 = position.amount1.token;

  // TODO: handle stable assets
  // if token0 is a dollar-stable asset, set it as the quote token
  // const stables = [DAI, USDC_MAINNET, USDT];
  // if (stables.some((stable) => stable.equals(token0))) {
  //   return {
  //     priceLower: position.token0PriceUpper.invert(),
  //     priceUpper: position.token0PriceLower.invert(),
  //     quote: token0,
  //     base: token1,
  //   };
  // }

  // if token1 is an ETH-/BTC-stable asset, set it as the base token
  // const bases = [...Object.values(WRAPPED_NATIVE_CURRENCY), WBTC];
  // if (bases.some((base) => base && base.equals(token1))) {
  //   return {
  //     priceLower: position.token0PriceUpper.invert(),
  //     priceUpper: position.token0PriceLower.invert(),
  //     quote: token0,
  //     base: token1,
  //   };
  // }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(JSBI.BigInt(1))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  };
}
