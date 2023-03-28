import { ChainId } from '@pangolindex/sdk';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

type FullRange = true;

export interface MintState {
  readonly independentField: Field;
  readonly typedValue: string;
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

  const setTypeInput = useCallback(
    ({ field, typedValue, noLiquidity }: { field: Field; typedValue: string; noLiquidity?: boolean }) => {
      if (noLiquidity) {
        if (field === mintState.independentField) {
          setMintState((state) => ({
            ...state,
            independentField: field,
            typedValue,
          }));
        } else {
          setMintState((state) => ({
            ...state,
            independentField: field,
            typedValue,
          }));
        }
      } else {
        setMintState((state) => ({
          ...state,
          independentField: field,
          typedValue,
        }));
      }
    },
    [setMintState, mintState],
  );

  const selectCurrency = useCallback(
    ({ currencyId, field, chainId }: { currencyId: string; field: Field; chainId: ChainId }) => {
      const otherField = field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

      if (currencyId === mintState[otherField].currencyId) {
        // the case where we have to swap the order
        setMintState((prev) => ({
          ...prev,
          independentField: prev[chainId]?.independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A,
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

  return {
    mintState,
    resetMintState,
    setFullRangeValue,
    setTypeStartPriceInput,
    setTypeLeftRangeInput,
    setTypeRightRangeInput,
    setTypeInput,
    selectCurrency,
  };
};
