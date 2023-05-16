/* eslint-disable max-lines */
import {
  CAVAX,
  Currency,
  CurrencyAmount,
  ElixirPool,
  FeeAmount,
  JSBI,
  Position,
  Price,
  Rounding,
  TICK_SPACINGS,
  TickMath,
  Token,
  encodeSqrtRatioX96,
  nearestUsableTick,
  priceToClosestTick,
  tickToPrice,
} from '@pangolindex/sdk';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_INT_ZERO } from 'src/constants';
import { PairState, usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { usePool } from 'src/hooks/elixir/hooks/common';
import { PoolState } from 'src/hooks/elixir/hooks/types';
import { useCurrency } from 'src/hooks/useCurrency';
import { tryParseAmount } from 'src/state/pswap/hooks/common';
import { wrappedCurrency, wrappedCurrencyAmount } from 'src/utils/wrappedCurrency';
import { useCurrencyBalances } from '../../pwallet/hooks/common';
import { Bound, Field, initialState, useMintStateAtom } from './atom';
import { getTickToPrice, tryParseTick } from './utils';

export function useMintState() {
  const { mintState } = useMintStateAtom();

  if (mintState) {
    return mintState;
  }
  return initialState;
}

export function useMintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void;
  onFieldBInput: (typedValue: string) => void;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  onStartPriceInput: (typedValue: string) => void;
  onSetFeeAmount: (value: FeeAmount) => void;
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onResetMintState: () => void;
  onSwitchCurrencies: () => void;
  onResettMintStateOnToggle: () => void;
} {
  const chainId = useChainId();
  const {
    setTypeInput,
    setTypeLeftRangeInput,
    setTypeRightRangeInput,
    setTypeStartPriceInput,
    selectCurrency,
    setFeeAmount,
    resetMintState,
    switchCurrencies,
    resetMintStateOnToggle,
  } = useMintStateAtom();

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      setTypeInput({ field: Field.CURRENCY_A, typedValue });
    },
    [setTypeInput, noLiquidity],
  );

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      setTypeInput({ field: Field.CURRENCY_B, typedValue });
    },
    [setTypeInput, noLiquidity],
  );

  const onLeftRangeInput = useCallback(
    (typedValue: string) => {
      setTypeLeftRangeInput({ typedValue });
    },
    [setTypeLeftRangeInput],
  );

  const onRightRangeInput = useCallback(
    (typedValue: string) => {
      setTypeRightRangeInput({ typedValue });
    },
    [setTypeRightRangeInput],
  );

  const onStartPriceInput = useCallback(
    (typedValue: string) => {
      setTypeStartPriceInput({ typedValue });
    },
    [setTypeStartPriceInput],
  );

  const onResetMintState = useCallback(() => {
    resetMintState();
  }, [resetMintState]);

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      selectCurrency({
        field,
        currencyId:
          currency instanceof Token
            ? currency.address
            : currency === CAVAX[chainId] && CAVAX[chainId]?.symbol
            ? (CAVAX[chainId]?.symbol as string)
            : '',
      });
    },
    [selectCurrency, chainId],
  );

  const onSetFeeAmount = useCallback(
    (value: FeeAmount) => {
      setFeeAmount({ value });
    },
    [setFeeAmount],
  );

  const onSwitchCurrencies = useCallback(() => {
    switchCurrencies();
  }, [switchCurrencies]);

  const onResettMintStateOnToggle = useCallback(() => {
    resetMintStateOnToggle();
  }, [resetMintState]);

  return {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
    onCurrencySelection,
    onSetFeeAmount,
    onResetMintState,
    onSwitchCurrencies,
    onResettMintStateOnToggle,
  };
}

export interface DerivedMintInfo {
  pool?: ElixirPool | null;
  poolState: PoolState;
  ticks: { [bound in Bound]?: number | undefined };
  price?: Price;
  pricesAtTicks: {
    [bound in Bound]?: Price | undefined;
  };
  pricesAtLimit: {
    [bound in Bound]?: Price | undefined;
  };
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount };
  dependentField: Field;
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  position: Position | undefined;
  noLiquidity?: boolean;
  errorMessage?: string;
  invalidPool: boolean;
  outOfRange: boolean;
  invalidRange: boolean;
  depositADisabled: boolean;
  depositBDisabled: boolean;
  invertPrice: boolean;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
}

export function useDerivedMintInfo(existingPosition?: Position): DerivedMintInfo {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();

  const { onStartPriceInput } = useMintActionHandlers(undefined);

  const {
    independentField,
    typedValue,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
    [Field.CURRENCY_A]: { currencyId: inputCurrencyId },
    [Field.CURRENCY_B]: { currencyId: outputCurrencyId },
    feeAmount,
  } = useMintState();

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  const currencyA = useCurrency(inputCurrencyId);
  const currencyB = useCurrency(outputCurrencyId);

  const [currencies, tokenA, tokenB, baseToken] = useMemo(() => {
    const wrapCurrency = (currency) => (currency ? wrappedCurrency(currency, chainId) : undefined);

    const tokenA: Token | undefined = wrapCurrency(currencyA);
    const tokenB: Token | undefined = wrapCurrency(currencyB);

    const [finalTokenA, finalTokenB]: [Token | undefined, Token | undefined] =
      tokenA && tokenB && tokenA.equals(tokenB) ? [tokenB, undefined] : [tokenA, tokenB];

    const baseToken: Token | undefined = wrapCurrency(currencyA);

    const currencies: { [field in Field]?: Currency | undefined } = {
      [Field.CURRENCY_A]: (tokenA && tokenB && tokenA.equals(tokenB) ? currencyB : currencyA) ?? undefined,
      [Field.CURRENCY_B]: (tokenA && tokenB && tokenA.equals(tokenB) ? undefined : currencyB) ?? undefined,
    };

    return [currencies, finalTokenA, finalTokenB, baseToken];
  }, [currencyA, currencyB]);

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB ? (tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined],
    [tokenA, tokenB],
  );

  // balances
  const balances = useCurrencyBalances(
    chainId,
    account ?? undefined,
    useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies]),
  );
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  };

  // try to find v2 pair for selected tokens to get Initial Start Price
  const [pairState, pair] = usePair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]);

  const pairExist = pairState === PairState.EXISTS;

  useEffect(() => {
    onStartPriceInput('');
  }, [tokenA, tokenB]);

  // v2 pair calculation
  const v2PriceIndependentAmount: CurrencyAmount | undefined = tryParseAmount(
    '1', // here we are statically keeping 1 to get 1 token price
    currencies[independentField],
    chainId,
  );
  const v2PriceDependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (v2PriceIndependentAmount && pairExist) {
      // we wrap the currencies just to get the price in terms of the other token
      const wrappedIndependentAmount = wrappedCurrencyAmount(v2PriceIndependentAmount, chainId);

      if (tokenA && tokenB && wrappedIndependentAmount && pair && chainId) {
        const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;
        const dependentTokenAmount =
          dependentField === Field.CURRENCY_B
            ? pair.priceOf(tokenA, tokenB).quote(wrappedIndependentAmount, chainId)
            : pair.priceOf(tokenB, tokenA).quote(wrappedIndependentAmount, chainId);
        return dependentCurrency === CAVAX[chainId]
          ? CurrencyAmount.ether(dependentTokenAmount.raw, chainId)
          : dependentTokenAmount;
      }
      return undefined;
    } else {
      return undefined;
    }
  }, [pairExist, currencies, dependentField, v2PriceIndependentAmount, tokenA, chainId, tokenB, pair]);

  useEffect(() => {
    if (pairExist && v2PriceDependentAmount) {
      onStartPriceInput(v2PriceDependentAmount?.toSignificant(24));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairExist, v2PriceDependentAmount?.toSignificant(24)]);

  // pool
  const [poolState, pool] = usePool(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B], feeAmount);
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  // note to parse inputs in reverse TODO
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0));

  // always returns the price with 0 as base token
  const price: Price | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseAmount(startPriceTypedValue, invertPrice ? token0 : token1, chainId);
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseAmount('1', invertPrice ? token1 : token0, chainId);
        const price =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency,
                parsedQuoteAmount.currency,
                baseAmount.numerator, // here we can not use quotient bcoz diffrence sdk logic decimal places
                parsedQuoteAmount.numerator,
              )
            : undefined;
        return (invertPrice ? price?.invert() : price) ?? undefined;
      }
      return undefined;
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0) : undefined;
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
    return (
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    );
  }, [price]);

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new ElixirPool(tokenA, tokenB, feeAmount, currentSqrt, JSBI.BigInt(0), currentTick, []);
    } else {
      return undefined;
    }
  }, [feeAmount, invalidPrice, price, tokenA, tokenB]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: ElixirPool | undefined = pool ?? mockPool;

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]) : undefined,
      [Bound.UPPER]: feeAmount ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]) : undefined,
    }),
    [feeAmount],
  );

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === 'number'
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseTick(token1, token0, feeAmount, rightRangeTypedValue.toString())
          : tryParseTick(token0, token1, feeAmount, leftRangeTypedValue.toString()),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === 'number'
          ? existingPosition.tickUpper
          : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseTick(token1, token0, feeAmount, leftRangeTypedValue.toString())
          : tryParseTick(token0, token1, feeAmount, rightRangeTypedValue.toString()),
    };
  }, [
    existingPosition,
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
  ]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount],
  );

  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper,
  );

  const pricesAtLimit = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0, token1, tickSpaceLimits.UPPER),
    };
  }, [token0, token1, tickSpaceLimits.LOWER, tickSpaceLimits.UPPER]);

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks;

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange && price && lowerPrice && upperPrice && (price.lessThan(lowerPrice) || price.greaterThan(upperPrice)),
  );

  // amounts
  const independentAmount: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    currencies[independentField],
    chainId,
  );

  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    // const wrappedIndependentAmount = independentAmount?.wrapped;

    const wrappedIndependentToken = currencies[independentField]
      ? wrappedCurrency(currencies[independentField], chainId)
      : undefined;

    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;

    if (
      independentAmount &&
      wrappedIndependentToken &&
      dependentCurrency &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined;
      }

      const position: Position | undefined = wrappedIndependentToken.equals(poolForPosition.token0)
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.numerator,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.numerator,
          });

      const dependentTokenAmount = wrappedIndependentToken.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0;
      return dependentCurrency === CAVAX[chainId]
        ? CurrencyAmount.ether(dependentTokenAmount.raw, chainId)
        : dependentTokenAmount;
    }

    return undefined;
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ]);

  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    };
  }, [dependentAmount, independentAmount, independentField]);

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  );

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA)),
    );
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB)),
    );

  // create position entity based on users selection
  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined;
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]?.numerator
      : BIG_INT_ZERO;
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]?.numerator
      : BIG_INT_ZERO;

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      });
    } else {
      return undefined;
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ]);

  let errorMessage: string | undefined;
  if (!account) {
    errorMessage = t('mintHooks.connectWallet');
  }

  if (!currencies[Field.CURRENCY_A] || !currencies[Field.CURRENCY_B]) {
    errorMessage = errorMessage ?? t('swapHooks.selectToken');
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? t('mintHooks.invalidPair');
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? `Invalid price input`;
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? t('mintHooks.enterAmount');
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts;

  if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
    errorMessage = `Insufficient ${currencies[Field.CURRENCY_A]?.symbol} balance`;
  }

  if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    errorMessage = `Insufficient ${currencies[Field.CURRENCY_B]?.symbol} balance`;
  }

  const invalidPool = poolState === PoolState.INVALID;
  return {
    dependentField,
    currencies,
    pool,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    pricesAtLimit,
    position,
    noLiquidity,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  };
}

export function useRangeHopCallbacks(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: ElixirPool | undefined | null,
) {
  const chainId = useChainId();
  const { setFullRangeValue } = useMintStateAtom();

  const tokenA = currencyA ? wrappedCurrency(currencyA, chainId) : undefined;
  const tokenB = currencyB ? wrappedCurrency(currencyB, chainId) : undefined;

  // const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency]);
  // const tokenB = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency]);

  const getDecrementLower = useCallback(() => {
    console.log('getDecrementLower Girdi');
    if (tokenA && tokenB && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(tokenA, tokenB, tickLower - TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (typeof tickLower !== 'number' && tokenA && tokenB && feeAmount && pool) {
      const newPrice = tickToPrice(tokenA, tokenB, pool?.tickCurrent - TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [tokenA, tokenB, tickLower, feeAmount, pool]);

  const getIncrementLower = useCallback(() => {
    console.log('getIncrementLower Girdi');
    if (tokenA && tokenB && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(tokenA, tokenB, tickLower + TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (typeof tickLower !== 'number' && tokenA && tokenB && feeAmount && pool) {
      const newPrice = tickToPrice(tokenA, tokenB, pool.tickCurrent + TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [tokenA, tokenB, tickLower, feeAmount, pool]);

  const getDecrementUpper = useCallback(() => {
    console.log('getDecrementUpper Girdi');
    if (tokenA && tokenB && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(tokenA, tokenB, tickUpper - TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (typeof tickUpper !== 'number' && tokenA && tokenB && feeAmount && pool) {
      const newPrice = tickToPrice(tokenA, tokenB, pool.tickCurrent - TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [tokenA, tokenB, tickUpper, feeAmount, pool]);

  const getIncrementUpper = useCallback(() => {
    console.log('getIncrementUpper Girdi');
    if (tokenA && tokenB && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(tokenA, tokenB, tickUpper + TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (typeof tickUpper !== 'number' && tokenA && tokenB && feeAmount && pool) {
      const newPrice = tickToPrice(tokenA, tokenB, pool.tickCurrent + TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return '';
  }, [tokenA, tokenB, tickUpper, feeAmount, pool]);

  const getSetFullRange = useCallback(() => {
    setFullRangeValue();
  }, [setFullRangeValue]);

  return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange };
}
/* eslint-enable max-lines */
