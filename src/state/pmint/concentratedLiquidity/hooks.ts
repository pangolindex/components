import { CAVAX, Currency, CurrencyAmount, JSBI, Token } from '@pangolindex/sdk';
import { useCallback } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';

import { useCurrency } from 'src/hooks/useCurrency';
import { useCurrencyBalances } from '../../pwallet/hooks/common';
import { Field, initialState, useMintStateAtom } from './atom';

const ZERO = JSBI.BigInt(0);

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
  onCurrencySelection: (field: Field, currency: Currency) => void;
} {
  const chainId = useChainId();
  const { setTypeInput, setTypeLeftRangeInput, setTypeRightRangeInput, setTypeStartPriceInput, selectCurrency } =
    useMintStateAtom();

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      setTypeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true });
    },
    [setTypeInput, noLiquidity],
  );

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      setTypeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true });
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
        chainId,
      });
    },
    [selectCurrency, chainId],
  );

  return {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
    onCurrencySelection,
  };
}

export function useDerivedMintInfo(): {
  currencies: { [field in Field]?: Currency };
  dependentField: Field;
  currencyBalances: { [field in Field]?: CurrencyAmount };
  // parsedAmounts: { [field in Field]?: CurrencyAmount };
  noLiquidity?: boolean;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const {
    independentField,
    typedValue,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
    [Field.CURRENCY_A]: { currencyId: inputCurrencyId },
    [Field.CURRENCY_B]: { currencyId: outputCurrencyId },
  } = useMintState();

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  // currencies
  const currencies: { [field in Field]?: Currency } = {
    [Field.CURRENCY_A]: inputCurrency ?? undefined,
    [Field.CURRENCY_B]: outputCurrency ?? undefined,
  };

  // balances
  const balances = useCurrencyBalances(chainId, account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  ]);
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  };

  const noLiquidity = false;

  return {
    dependentField,
    currencies,
    currencyBalances,
    noLiquidity,
  };
}
