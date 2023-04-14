import { FeeAmount } from '@pangolindex/sdk';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}
export enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER',
}

type FullRange = true;

export interface MintState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly feeAmount: FeeAmount | undefined;
  readonly startPriceTypedValue: string; // for the case when there's no liquidity
  readonly leftRangeTypedValue: string | FullRange;
  readonly rightRangeTypedValue: string | FullRange;
  readonly [Field.CURRENCY_A]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.CURRENCY_B]: {
    readonly currencyId: string | undefined;
  };
}

export const initialState: MintState = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  feeAmount: undefined,
  startPriceTypedValue: '',
  leftRangeTypedValue: '',
  rightRangeTypedValue: '',
  [Field.CURRENCY_A]: {
    currencyId: '',
  },
  [Field.CURRENCY_B]: {
    currencyId: '',
  },
};

const mintStateAtom = atom<MintState>(initialState);

export const useMintStateAtom = () => {
  const [mintState, setMintState] = useAtom(mintStateAtom);

  const resetMintState = useCallback(() => {
    setMintState(initialState);
  }, [setMintState]);

  const setFullRangeValue = useCallback(() => {
    setMintState((state) => ({
      ...state,
      leftRangeTypedValue: true,
      rightRangeTypedValue: true,
    }));
  }, [setMintState]);

  const setTypeStartPriceInput = useCallback(
    ({ typedValue }: { typedValue: string }) => {
      setMintState((state) => ({
        ...state,
        startPriceTypedValue: typedValue,
      }));
    },
    [setMintState],
  );

  const setTypeLeftRangeInput = useCallback(
    ({ typedValue }: { typedValue: string }) => {
      setMintState((state) => ({
        ...state,
        leftRangeTypedValue: typedValue,
      }));
    },
    [setMintState],
  );

  const setTypeRightRangeInput = useCallback(
    ({ typedValue }: { typedValue: string }) => {
      setMintState((state) => ({
        ...state,
        rightRangeTypedValue: typedValue,
      }));
    },
    [setMintState],
  );

  const setFeeAmount = useCallback(
    ({ value }: { value: FeeAmount }) => {
      setMintState((state) => ({
        ...state,
        feeAmount: value,
      }));
    },
    [setMintState],
  );

  const setTypeInput = useCallback(
    ({ field, typedValue }: { field: Field; typedValue: string }) => {
      setMintState((state) => ({
        ...state,
        independentField: field,
        typedValue,
      }));
    },
    [setMintState, mintState],
  );

  const selectCurrency = useCallback(
    ({ currencyId, field }: { currencyId: string; field: Field }) => {
      const otherField = field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

      if (currencyId === mintState[otherField].currencyId) {
        // the case where we have to swap the order
        setMintState((prev) => ({
          ...prev,
          independentField: prev?.independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: prev[field].currencyId },
        }));
      } else {
        // the normal case
        setMintState((prev) => ({
          ...prev,
          [field]: { currencyId: currencyId },
        }));
      }
    },
    [setMintState, mintState],
  );

  const switchCurrencies = useCallback(() => {
    const currencyId0 = mintState[Field.CURRENCY_A].currencyId;
    const currencyId1 = mintState[Field.CURRENCY_B].currencyId;

    if (currencyId0 && currencyId1) {
      const temp = currencyId0;
      setMintState((prev) => ({
        ...prev,
        [Field.CURRENCY_A]: { currencyId: currencyId1 },
        [Field.CURRENCY_B]: { currencyId: temp },
      }));
    }
  }, [setMintState, mintState]);

  return {
    mintState,
    resetMintState,
    setFullRangeValue,
    setTypeStartPriceInput,
    setTypeLeftRangeInput,
    setTypeRightRangeInput,
    setTypeInput,
    selectCurrency,
    setFeeAmount,
    switchCurrencies,
  };
};
