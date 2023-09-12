import { CAVAX, ChainId, WAVAX } from '@pangolindex/sdk';
import { ZERO_ADDRESS } from '@honeycomb/shared';
import { Hedera } from '@honeycomb/wallet-connectors';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum LimitField {
  INPUT = 'input',
  OUTPUT = 'output',
  PRICE = 'price',
}

export enum LimitNewField {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  PRICE = 'PRICE',
}

export enum LimitRate {
  MUL = 'MUL',
  DIV = 'DIV',
}

export interface FeeInfo {
  feePartner: number;
  feeProtocol: number;
  feeTotal: number;
  feeCut: number;
  initialized: boolean;
}

export interface SwapParams {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null;
}

export interface DefaultSwapState extends SwapParams {
  readonly feeTo: string;
  readonly feeInfo: FeeInfo;
}

interface ReplaceSwapState {
  typedValue: string;
  recipient: string | null;
  field: Field;
  inputCurrencyId: string;
  outputCurrencyId: string;
  chainId: ChainId;
}

const initialValue = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: '',
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  recipient: null,
  feeTo: ZERO_ADDRESS,
  feeInfo: {
    feePartner: 0,
    feeProtocol: 0,
    feeTotal: 0,
    feeCut: 50_00, // 50%
    initialized: false,
  },
};

export type SwapState = {
  [chainId in ChainId]: DefaultSwapState;
};

const initialState: SwapState = {
  [ChainId.FUJI]: initialValue,
  [ChainId.AVALANCHE]: initialValue,
  [ChainId.WAGMI]: initialValue,
  [ChainId.COSTON]: initialValue,
  [ChainId.SONGBIRD]: initialValue,
  [ChainId.FLARE_MAINNET]: initialValue,
  [ChainId.HEDERA_TESTNET]: initialValue,
  [ChainId.HEDERA_MAINNET]: initialValue,
  [ChainId.NEAR_MAINNET]: initialValue,
  [ChainId.NEAR_TESTNET]: initialValue,
  [ChainId.COSTON2]: initialValue,
  [ChainId.EVMOS_TESTNET]: initialValue,
  [ChainId.EVMOS_MAINNET]: initialValue,
  // TODO:
  [ChainId.ETHEREUM]: initialValue,
  [ChainId.POLYGON]: initialValue,
  [ChainId.FANTOM]: initialValue,
  [ChainId.XDAI]: initialValue,
  [ChainId.BSC]: initialValue,
  [ChainId.ARBITRUM]: initialValue,
  [ChainId.CELO]: initialValue,
  [ChainId.OKXCHAIN]: initialValue,
  [ChainId.VELAS]: initialValue,
  [ChainId.AURORA]: initialValue,
  [ChainId.CRONOS]: initialValue,
  [ChainId.FUSE]: initialValue,
  [ChainId.MOONRIVER]: initialValue,
  [ChainId.MOONBEAM]: initialValue,
  [ChainId.OP]: initialValue,
  [ChainId.SKALE_BELLATRIX_TESTNET]: initialValue,
};

const swapStateAtom = atom<SwapState>(initialState);

export const useSwapState = () => {
  const [swapState, setSwapState] = useAtom(swapStateAtom);

  const replaceSwapState = useCallback(
    ({ typedValue, recipient, field, inputCurrencyId, outputCurrencyId, chainId }: ReplaceSwapState) => {
      setSwapState((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          independentField: field,
          typedValue: typedValue,
          recipient,
        },
      }));
    },
    [setSwapState],
  );

  const switchCurrencies = useCallback(
    ({ chainId }: { chainId: ChainId }) => {
      setSwapState((prev) => {
        let inputCurrencyId = prev[chainId]?.[Field.INPUT].currencyId;
        const outputcurrencyId = prev[chainId]?.[Field.OUTPUT].currencyId;
        const currency = CAVAX[chainId];
        const wrappedCurrency = WAVAX[chainId];

        // we need to change from hbar to whbar when if the field.input is hbar
        if (
          Hedera.isHederaChain(chainId) &&
          inputCurrencyId === currency.symbol &&
          outputcurrencyId !== wrappedCurrency.address
        ) {
          inputCurrencyId = wrappedCurrency.address;
        }

        return {
          ...prev,
          [chainId]: {
            ...prev[chainId],
            independentField: prev[chainId]?.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
            [Field.INPUT]: { currencyId: outputcurrencyId },
            [Field.OUTPUT]: { currencyId: inputCurrencyId },
          },
        };
      });
    },
    [setSwapState],
  );

  const selectCurrency = useCallback(
    ({ currencyId, field, chainId }: { currencyId: string; field: Field; chainId: ChainId }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;

      if (currencyId === swapState[chainId][otherField].currencyId) {
        // the case where we have to swap the order
        switchCurrencies({ chainId });
      } else {
        // the normal case
        setSwapState((prev) => ({
          ...prev,
          [chainId]: {
            ...prev[chainId],
            [field]: { currencyId: currencyId },
          },
        }));
      }
    },
    [setSwapState, swapState],
  );

  const typeInput = useCallback(
    ({ field, typedValue, chainId }: { field: Field; typedValue: string; chainId: ChainId }) => {
      setSwapState((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          independentField: field,
          typedValue,
        },
      }));
    },
    [setSwapState],
  );

  const setRecipient = useCallback(
    ({ recipient, chainId }: { recipient: string | null; chainId: ChainId }) => {
      setSwapState((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          recipient: recipient,
        },
      }));
    },
    [setSwapState],
  );

  const updateFeeTo = useCallback(
    ({ feeTo, chainId }: { feeTo: string; chainId: ChainId }) => {
      setSwapState((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          feeTo: feeTo,
        },
      }));
    },
    [setSwapState],
  );

  const updateFeeInfo = useCallback(
    ({ feeInfo, chainId }: { feeInfo: FeeInfo; chainId: ChainId }) => {
      setSwapState((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          feeInfo: feeInfo,
        },
      }));
    },
    [setSwapState],
  );

  return {
    swapState,
    replaceSwapState,
    selectCurrency,
    switchCurrencies,
    typeInput,
    setRecipient,
    updateFeeTo,
    updateFeeInfo,
  };
};
