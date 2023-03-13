import {
  CAVAX,
  Currency,
  CurrencyAmount,
  InsufficientInputAmountError,
  JSBI,
  Pair,
  Percent,
  Price,
  TokenAmount,
} from '@pangolindex/sdk';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePairTotalSupplyHook } from 'src/data/multiChainsHooks';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { AppState, useDispatch, useSelector } from 'src/state';
import { PairState, usePair } from '../../data/Reserves';
import { wrappedCurrency, wrappedCurrencyAmount } from '../../utils/wrappedCurrency';
import { tryParseAmount } from '../pswap/hooks/common';
import { useCurrencyBalances } from '../pwallet/hooks/common';
import { Field, typeInput } from './actions';
import { initialKeyState } from './reducer';

const ZERO = JSBI.BigInt(0);

export function useMintState(pairAddress: string) {
  return useSelector<AppState['pmint']['any']>((state) => {
    const pairState = state.pmint[pairAddress];
    if (pairState) {
      return pairState;
    }
    return initialKeyState;
  });
}

export function useDerivedMintInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  dependentField: Field;
  currencies: { [field in Field]?: Currency };
  pair?: Pair | null;
  pairState: PairState;
  currencyBalances: { [field in Field]?: CurrencyAmount };
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  price?: Price;
  noLiquidity?: boolean;
  liquidityMinted?: TokenAmount;
  poolTokenPercentage?: Percent;
  error?: string;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const usePairTotalSupply = usePairTotalSupplyHook[chainId];

  const { t } = useTranslation();

  const wrappedCurrencyA = wrappedCurrency(currencyA, chainId);
  const wrappedCurrencyB = wrappedCurrency(currencyB, chainId);

  const pairAddress = wrappedCurrencyA && wrappedCurrencyB ? Pair.getAddress(wrappedCurrencyA, wrappedCurrencyB) : '';

  const { independentField, typedValue, otherTypedValue } = useMintState(pairAddress);

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  // error handling
  let insufficientInput = false;

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined,
    }),
    [currencyA, currencyB],
  );

  // pair
  const [pairState, pair] = usePair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]);

  const totalSupply = usePairTotalSupply(pair ?? undefined);

  const noLiquidity: boolean =
    pairState === PairState.NOT_EXISTS || !totalSupply || Boolean(totalSupply && JSBI.equal(totalSupply.raw, ZERO));

  // balances
  const balances = useCurrencyBalances(chainId, account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  ]);
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  };

  // amounts
  const independentAmount: CurrencyAmount | undefined = tryParseAmount(
    typedValue,

    currencies[independentField],
    chainId,
  );
  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (noLiquidity) {
      if (otherTypedValue && currencies[dependentField]) {
        return tryParseAmount(otherTypedValue, currencies[dependentField], chainId);
      }
      return undefined;
    } else if (independentAmount) {
      // we wrap the currencies just to get the price in terms of the other token
      const wrappedIndependentAmount = wrappedCurrencyAmount(independentAmount, chainId);
      const [tokenA, tokenB] = [wrappedCurrencyA, wrappedCurrencyB];
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
  }, [
    noLiquidity,
    otherTypedValue,
    currencies,
    dependentField,
    independentAmount,
    currencyA,
    chainId,
    currencyB,
    pair,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = {
    [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
    [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
  };

  const price = useMemo(() => {
    if (noLiquidity) {
      const { [Field.CURRENCY_A]: _currencyAAmount, [Field.CURRENCY_B]: _currencyBAmount } = parsedAmounts;
      if (_currencyAAmount && _currencyBAmount) {
        return new Price(
          _currencyAAmount.currency,
          _currencyBAmount.currency,
          _currencyAAmount.raw,
          _currencyBAmount.raw,
        );
      }
      return undefined;
    } else {
      return pair && wrappedCurrencyA && wrappedCurrencyB
        ? pair.priceOf(wrappedCurrencyA, wrappedCurrencyB)
        : undefined;
    }
  }, [chainId, currencyA, currencyB, noLiquidity, pair, parsedAmounts, wrappedCurrencyA, wrappedCurrencyB]);

  // liquidity minted
  const liquidityMinted = useMemo(() => {
    const { [Field.CURRENCY_A]: _currencyAAmount, [Field.CURRENCY_B]: _currencyBAmount } = parsedAmounts;
    const [tokenAmountA, tokenAmountB] = [
      wrappedCurrencyAmount(_currencyAAmount, chainId),
      wrappedCurrencyAmount(_currencyBAmount, chainId),
    ];
    insufficientInput = false; // eslint-disable-line react-hooks/exhaustive-deps
    if (pair && totalSupply && tokenAmountA && tokenAmountB) {
      try {
        return pair.getLiquidityMinted(totalSupply, [tokenAmountA, tokenAmountB]);
      } catch (err) {
        if (err instanceof InsufficientInputAmountError) {
          insufficientInput = true;
          return undefined;
        } else {
          throw err;
        }
      }
    } else {
      return undefined;
    }
  }, [parsedAmounts, chainId, pair, totalSupply]);

  const poolTokenPercentage = useMemo(() => {
    if (liquidityMinted && totalSupply) {
      return new Percent(liquidityMinted.raw, totalSupply.add(liquidityMinted).raw);
    } else {
      return undefined;
    }
  }, [liquidityMinted, totalSupply]);

  let error: string | undefined;
  if (!account) {
    error = t('mintHooks.connectWallet');
  }

  if (insufficientInput) {
    error = t('mintHooks.insufficientInputAmount');
  }

  if (pairState === PairState.INVALID) {
    error = error ?? t('mintHooks.invalidPair');
  }

  if (!parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? t('mintHooks.enterAmount');
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts;

  if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
    error = t('mintHooks.insufficientBalance', { symbol: currencies[Field.CURRENCY_A]?.symbol });
  }

  if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    error = t('mintHooks.insufficientBalance', { symbol: currencies[Field.CURRENCY_B]?.symbol });
  }

  return {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  };
}

export function useMintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string, pairAddress: string) => void;
  onFieldBInput: (typedValue: string, pairAddress: string) => void;
} {
  const dispatch = useDispatch();

  const onFieldAInput = useCallback(
    (typedValue: string, pairAddress: string) => {
      dispatch(
        typeInput({ pairAddress: pairAddress, field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }),
      );
    },
    [dispatch, noLiquidity],
  );
  const onFieldBInput = useCallback(
    (typedValue: string, pairAddress: string) => {
      dispatch(
        typeInput({ pairAddress: pairAddress, field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }),
      );
    },
    [dispatch, noLiquidity],
  );

  return {
    onFieldAInput,
    onFieldBInput,
  };
}
