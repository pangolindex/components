import { ChainId } from '@pangolindex/sdk';
import { createReducer } from '@reduxjs/toolkit';
import { ZERO_ADDRESS } from '../../constants';
import {
  FeeInfo,
  Field,
  replaceSwapState,
  selectCurrency,
  setRecipient,
  switchCurrencies,
  typeInput,
  updateFeeInfo,
  updateFeeTo,
} from './actions';

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
  [ChainId.HEDERA_TESTNET]: initialValue,
  [ChainId.NEAR_MAINNET]: initialValue,
  [ChainId.NEAR_TESTNET]: initialValue,
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
};

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId, chainId } }) => {
        state[chainId] = {
          ...state[chainId],
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          independentField: field,
          typedValue: typedValue,
          recipient,
        };

        return state;
      },
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field, chainId } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
      if (currencyId === state[chainId][otherField].currencyId) {
        // the case where we have to swap the order
        state[chainId] = {
          ...state[chainId],
          independentField: state[chainId]?.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[chainId]?.[field].currencyId },
        };
      } else {
        // the normal case
        state[chainId] = {
          ...state[chainId],
          [field]: { currencyId: currencyId },
        };
      }

      return state;
    })
    .addCase(switchCurrencies, (state, { payload: { chainId } }) => {
      state[chainId] = {
        ...state[chainId],
        independentField: state[chainId]?.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[chainId]?.[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[chainId]?.[Field.INPUT].currencyId },
      };

      return state;
    })
    .addCase(typeInput, (state, { payload: { field, typedValue, chainId } }) => {
      state[chainId] = {
        ...state[chainId],
        independentField: field,
        typedValue,
      };

      return state;
    })
    .addCase(setRecipient, (state, { payload: { recipient, chainId } }) => {
      state[chainId].recipient = recipient;
    })
    .addCase(updateFeeTo, (state, { payload: { feeTo, chainId } }) => {
      state[chainId].feeTo = feeTo;
    })
    .addCase(updateFeeInfo, (state, { payload: { feeInfo, chainId } }) => {
      state[chainId].feeInfo = feeInfo;
    }),
);
