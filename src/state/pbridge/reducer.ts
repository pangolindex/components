import { createReducer } from '@reduxjs/toolkit';
import {
  ChainField,
  CurrencyField,
  replaceBridgeState,
  selectChain,
  selectCurrency,
  setRecipient,
  switchChains,
  switchCurrencies,
  typeAmount,
} from './actions';

export interface BridgeState {
  readonly typedValue: string;
  readonly [CurrencyField.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [CurrencyField.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [ChainField.FROM]: {
    readonly chainId: string | undefined;
  };
  readonly [ChainField.TO]: {
    readonly chainId: string | undefined;
  };
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null;
}

const initialState: BridgeState = {
  typedValue: '',
  [CurrencyField.INPUT]: {
    currencyId: '',
  },
  [CurrencyField.OUTPUT]: {
    currencyId: '',
  },
  [ChainField.FROM]: {
    chainId: '',
  },
  [ChainField.TO]: {
    chainId: '',
  },
  recipient: null,
};

export default createReducer<BridgeState>(initialState, (builder) =>
  builder
    .addCase(
      replaceBridgeState,
      (state, { payload: { recipient, inputCurrencyId, outputCurrencyId, fromChainId, toChainId } }) => {
        return {
          ...state,
          typedValue: '',
          [CurrencyField.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [CurrencyField.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          [ChainField.FROM]: {
            chainId: fromChainId,
          },
          [ChainField.TO]: {
            chainId: toChainId,
          },
          recipient,
        };
      },
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      return {
        ...state,
        [field]: { currencyId: currencyId },
      };
    })
    .addCase(selectChain, (state, { payload: { chainId, field } }) => {
      return {
        ...state,
        [field]: { chainId: chainId },
      };
    })
    .addCase(typeAmount, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        field: field,
        typedValue,
      };
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        [CurrencyField.INPUT]: { currencyId: state[CurrencyField.OUTPUT].currencyId },
        [CurrencyField.OUTPUT]: { currencyId: state[CurrencyField.INPUT].currencyId },
      };
    })
    .addCase(switchChains, (state) => {
      return {
        ...state,
        [ChainField.FROM]: { chainId: state[ChainField.TO].chainId },
        [ChainField.TO]: { chainId: state[ChainField.FROM].chainId },
      };
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient;
    }),
);
