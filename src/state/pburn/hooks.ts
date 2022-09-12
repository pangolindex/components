import { Currency, CurrencyAmount, JSBI, Pair, Percent, Token, TokenAmount } from '@pangolindex/sdk';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_INT_ZERO } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { AppState, useDispatch, useSelector } from 'src/state';
import { useTokenBalancesHook } from 'src/state/pwallet/multiChainsHooks';
import { isEvmChain } from 'src/utils';
import { usePair } from '../../data/Reserves';
import { useTotalSupplyHook } from '../../data/TotalSupply';
import { tryParseAmount } from '../../state/pswap/hooks';
import { wrappedCurrency } from '../../utils/wrappedCurrency';
import { Field, typeInput } from './actions';

export function useBurnState(): AppState['pburn'] {
  return useSelector<AppState['pburn']>((state) => state.pburn);
}

export function useDerivedBurnInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  pair?: Pair | null;
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent;
    [Field.LIQUIDITY]?: TokenAmount;
    [Field.CURRENCY_A]?: CurrencyAmount;
    [Field.CURRENCY_B]?: CurrencyAmount;
  };
  error?: string;
  userLiquidity?: TokenAmount;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const useTokenBalances = useTokenBalancesHook[chainId];
  const useTotalSupply = useTotalSupplyHook[chainId];

  const { t } = useTranslation();

  const { independentField, typedValue } = useBurnState();

  // pair + totalsupply
  const [, pair] = usePair(currencyA, currencyB);
  const pairOrToken = isEvmChain(chainId) ? pair?.liquidityToken : pair;

  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [pairOrToken] as Token[]);

  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[pair?.liquidityToken?.address ?? ''];

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)];
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: pair?.liquidityToken,
  };

  // liquidity values
  const totalSupply = useTotalSupply(pairOrToken as Token);

  const [liquidityValue0, liquidityValue1] =
    pair &&
    totalSupply &&
    userLiquidity &&
    tokenA &&
    tokenB &&
    JSBI.greaterThan(totalSupply.raw, BIG_INT_ZERO) &&
    JSBI.greaterThan(userLiquidity.raw, BIG_INT_ZERO) &&
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? pair.getLiquidityValues(totalSupply, userLiquidity, { feeOn: false })
      : [undefined, undefined];

  const liquidityValueA = tokenA && pair?.token0.equals(tokenA) ? liquidityValue0 : liquidityValue1;
  const liquidityValueB = tokenB && pair?.token0.equals(tokenB) ? liquidityValue0 : liquidityValue1;

  const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount; [Field.CURRENCY_B]?: TokenAmount } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB,
  };

  let percentToRemove: Percent = new Percent('0', '100');
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = new Percent(typedValue, '100');
  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    if (pair?.liquidityToken) {
      const independentAmount = tryParseAmount(typedValue, pair.liquidityToken, chainId);
      if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw);
      }
    }
  }
  // user specified a specific amount of token a or b
  else {
    if (tokens[independentField]) {
      const independentAmount = tryParseAmount(typedValue, tokens[independentField], chainId);
      const liquidityValue = liquidityValues[independentField];
      if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
        percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw);
      }
    }
  }

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent;
    [Field.LIQUIDITY]?: TokenAmount;
    [Field.CURRENCY_A]?: TokenAmount;
    [Field.CURRENCY_B]?: TokenAmount;
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
      userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
        ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
        : undefined,
    [Field.CURRENCY_A]:
      tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
        ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
        : undefined,
    [Field.CURRENCY_B]:
      tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
        ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
        : undefined,
  };

  let error: string | undefined;
  if (!account) {
    error = t('burnHooks.connectWallet');
  }

  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? t('burnHooks.enterAmount');
  }

  return { pair, parsedAmounts, error, userLiquidity };
}

export function useBurnActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void;
} {
  const dispatch = useDispatch();

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch],
  );

  return {
    onUserInput,
  };
}
