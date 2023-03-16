import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export enum Field {
  LIQUIDITY_PERCENT = 'LIQUIDITY_PERCENT',
  LIQUIDITY = 'LIQUIDITY',
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

interface BurnState {
  [pairAddress: string]: {
    readonly independentField: Field;
    readonly typedValue: string;
  };
}

export const initialKeyState = {
  independentField: Field.CURRENCY_A,
  typedValue: '0',
};

const burnStateAtom = atom<BurnState>({});

export function useBurnStateAtom() {
  const [burnState, setBurnState] = useAtom(burnStateAtom);

  const typeInput = useCallback(
    ({ pairAddress, field, typedValue }: { pairAddress: string; field: Field; typedValue: string }) => {
      setBurnState((prev) => {
        const pairState = prev[pairAddress] || initialKeyState;
        return {
          ...prev,
          [pairAddress]: {
            ...pairState,
            independentField: field,
            typedValue: typedValue,
          },
        };
      });
    },
    [setBurnState],
  );

  const resetBurnState = useCallback(
    ({ pairAddress }: { pairAddress: string }) => {
      setBurnState((prev) => {
        return {
          ...prev,
          [pairAddress]: initialKeyState,
        };
      });
    },
    [setBurnState],
  );

  return { burnState, typeInput, resetBurnState };
}
