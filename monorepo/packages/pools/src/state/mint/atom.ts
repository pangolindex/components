import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export interface MintState {
  [x: string]: {
    // the key is the pair address or contract address
    readonly independentField: Field;
    readonly typedValue: string;
    readonly otherTypedValue: string; // for the case when there's no liquidity
  };
}

export const initialKeyState = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  otherTypedValue: '',
};

export const mintStateAtom = atom<MintState>({});

export function useMintStateAtom() {
  const [mintState, setMintState] = useAtom(mintStateAtom);

  const resetMintState = useCallback(
    ({ pairAddress }: { pairAddress: string }) => {
      setMintState((prev) => {
        return {
          ...prev,
          [pairAddress]: initialKeyState,
        };
      });
    },
    [setMintState],
  );

  const typeInput = useCallback(
    ({
      pairAddress,
      field,
      typedValue,
      noLiquidity,
    }: {
      pairAddress: string;
      field: Field;
      typedValue: string;
      noLiquidity: boolean;
    }) => {
      setMintState((state) => {
        const pairState = state[pairAddress] || initialKeyState;
        if (noLiquidity) {
          if (field === pairState.independentField) {
            return {
              ...state,
              [pairAddress]: {
                ...pairState,
                independentField: field,
                typedValue,
              },
            };
          } else {
            return {
              ...state,
              [pairAddress]: {
                ...pairState,
                independentField: field,
                typedValue,
                otherTypedValue: pairState.typedValue,
              },
            };
          }
        } else {
          return {
            ...state,
            [pairAddress]: {
              ...pairState,
              independentField: field,
              typedValue,
              otherTypedValue: '',
            },
          };
        }
      });
    },
    [setMintState],
  );

  return { mintState, resetMintState, typeInput };
}
