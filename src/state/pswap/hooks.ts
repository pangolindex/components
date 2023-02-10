/* eslint-disable max-lines */
import { parseUnits } from '@ethersproject/units';
import { Order, useGelatoLimitOrdersHistory, useGelatoLimitOrdersLib } from '@gelatonetwork/limit-orders-react';
import {
  CAVAX,
  ChainId,
  Currency,
  CurrencyAmount,
  FACTORY_ADDRESS,
  JSBI,
  Price,
  Token,
  TokenAmount,
  Trade,
} from '@pangolindex/sdk';
import { ParsedQs } from 'qs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NATIVE, ROUTER_ADDRESS, ROUTER_DAAS_ADDRESS, SWAP_DEFAULT_CURRENCY } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useCurrency, useHederaTokenAssociated } from 'src/hooks/Tokens';
import { useTradeExactIn, useTradeExactOut } from 'src/hooks/Trades';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import useToggledVersion, { Version } from 'src/hooks/useToggledVersion';
import { AppState, useDispatch, useSelector } from 'src/state';
import { isAddress, isEvmChain, validateAddressMapping } from 'src/utils';
import { computeSlippageAdjustedAmounts } from 'src/utils/prices';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { useUserSlippageTolerance } from '../puser/hooks';
import { useCurrencyBalances } from '../pwallet/hooks';
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
import { DefaultSwapState, SwapParams } from './reducer';

export interface LimitOrderInfo extends Order {
  pending?: boolean;
}

export function useSwapState(): DefaultSwapState {
  const chainId = useChainId();

  const state = useSelector<AppState['pswap']>((state) => state.pswap);

  const swapState = chainId ? state[chainId] ?? {} : ({} as DefaultSwapState);
  return swapState;
}

export function useSwapActionHandlers(chainId: ChainId): {
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const dispatch = useDispatch();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId:
            currency instanceof Token
              ? currency.address
              : currency === CAVAX[chainId] && CAVAX[chainId]?.symbol
              ? (CAVAX[chainId]?.symbol as string)
              : '',
          chainId,
        }),
      );
    },
    [dispatch, chainId],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies({ chainId }));
  }, [dispatch, chainId]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue, chainId }));
    },
    [dispatch, chainId],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient, chainId }));
    },
    [dispatch, chainId],
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  };
}

// try to parse a user entered amount for a given token
export function tryParseAmount(
  value?: string,
  currency?: Currency,
  chainId: ChainId = ChainId.AVALANCHE,
): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed), chainId);
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  FACTORY_ADDRESS[ChainId.AVALANCHE], // v2 factory
  ROUTER_ADDRESS[ChainId.AVALANCHE], // v2 router 02
  ROUTER_DAAS_ADDRESS[ChainId.AVALANCHE], // DaaS router
];

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pools.some((pool) => pool.liquidityToken.address === checksummedAddress)
  );
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount };
  parsedAmount: CurrencyAmount | undefined;
  v2Trade: Trade | undefined;
  inputError?: string;
  v1Trade: Trade | undefined;
  isLoading: boolean;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const toggledVersion = useToggledVersion();

  const checkRecipientAddress = validateAddressMapping[chainId];

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const recipientAddress = isEvmChain(chainId) && recipient ? checkRecipientAddress(recipient) : recipient;
  const to: string | null = (recipientAddress ? recipientAddress : account) ?? null;

  const relevantTokenBalances = useCurrencyBalances(chainId, account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined, chainId);

  const { trade: bestTradeExactIn, isLoading: isLoadingIn } = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
  );
  const { trade: bestTradeExactOut, isLoading: isLoadingOut } = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
  );

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  };

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  };

  // get link to trade on v1, if a better rate exists
  const v1Trade = undefined;

  let inputError: string | undefined;
  if (!account) {
    inputError = 'Connect Wallet';
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount';
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token';
  }

  const formattedTo = to;

  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient';
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient';
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance();

  const slippageAdjustedAmounts =
    v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage);

  const slippageAdjustedAmountsV1 =
    v1Trade && allowedSlippage && computeSlippageAdjustedAmounts(v1Trade, allowedSlippage);

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    toggledVersion === Version.v1
      ? slippageAdjustedAmountsV1
        ? slippageAdjustedAmountsV1[Field.INPUT]
        : null
      : slippageAdjustedAmounts
      ? slippageAdjustedAmounts[Field.INPUT]
      : null,
  ];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance';
  }

  const isLoading = isExactIn ? isLoadingIn : isLoadingOut;

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    v1Trade,
    isLoading,
  };
}

export function useHederaSwapTokenAssociated(): {
  associate: undefined | (() => Promise<void>);
  isLoading: boolean;
  hederaAssociated: boolean;
} {
  const chainId = useChainId();

  const {
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();

  const outputCurrency = useCurrency(outputCurrencyId);
  const token = outputCurrency ? wrappedCurrency(outputCurrency, chainId) : undefined;
  const { associate, isLoading, hederaAssociated } = useHederaTokenAssociated(token?.address, token?.symbol);

  if (outputCurrency === CAVAX[chainId]) {
    return {
      associate: undefined,
      isLoading: false,
      hederaAssociated: true,
    };
  }

  return {
    associate,
    isLoading,
    hederaAssociated,
  };
}

export function parseCurrencyFromURLParameter(urlParam: any, chainId: ChainId): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam);
    if (valid) return valid;
    if (urlParam.toUpperCase() === CAVAX[chainId]?.symbol?.toUpperCase()) return CAVAX[chainId]?.symbol as string;
    if (valid === false) return CAVAX[chainId]?.symbol as string;
  }
  //return 'AVAX' ?? '';
  return '';
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : '';
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT;
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null;
  const address = isAddress(recipient);
  if (address) return address;
  if (ENS_NAME_REGEX.test(recipient)) return recipient;
  if (ADDRESS_REGEX.test(recipient)) return recipient;
  return null;
}

export function queryParametersToSwapState(parsedQs: ParsedQs, chainId: ChainId): SwapParams {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, chainId);
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency, chainId);
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = '';
    } else {
      outputCurrency = '';
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient);

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  };
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const chainId = useChainId();
  const dispatch = useDispatch();
  const parsedQs = useParsedQueryString();
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >();

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();

  useEffect(() => {
    if (!chainId) return;

    const parsed = queryParametersToSwapState(parsedQs, chainId);

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId
          ? parsed[Field.INPUT].currencyId
          : inputCurrencyId
          ? inputCurrencyId
          : SWAP_DEFAULT_CURRENCY[chainId]?.inputCurrency,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId
          ? parsed[Field.OUTPUT].currencyId
          : outputCurrencyId
          ? outputCurrencyId
          : SWAP_DEFAULT_CURRENCY[chainId]?.outputCurrency,
        recipient: parsed.recipient,
        chainId,
      }),
    );

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId]);

  return result;
}

export function useGelatoLimitOrderDetail(order: Order) {
  const chainId = useChainId();
  const gelatoLibrary = useGelatoLimitOrdersLib();

  const inputCurrency = order.inputToken === NATIVE && chainId ? 'AVAX' : order.inputToken;
  const outputCurrency = order.outputToken === NATIVE && chainId ? 'AVAX' : order.outputToken;

  const currency0 = useCurrency(inputCurrency);
  const currency1 = useCurrency(outputCurrency);

  const inputToken = currency0 ? wrappedCurrency(currency0, chainId) : undefined;
  const outputToken = currency1 ? wrappedCurrency(currency1, chainId) : undefined;

  const inputAmount = useMemo(
    () => (inputToken && order.inputAmount ? new TokenAmount(inputToken, order.inputAmount) : undefined),
    [inputToken, order.inputAmount],
  );

  const rawMinReturn = useMemo(
    () =>
      order.adjustedMinReturn
        ? order.adjustedMinReturn
        : gelatoLibrary && chainId && order.minReturn
        ? gelatoLibrary.getAdjustedMinReturn(order.minReturn)
        : undefined,
    [chainId, gelatoLibrary, order.adjustedMinReturn, order.minReturn],
  );

  const outputAmount = useMemo(
    () => (outputToken && rawMinReturn ? new TokenAmount(outputToken, rawMinReturn) : undefined),
    [outputToken, rawMinReturn],
  );

  const executionPrice = useMemo(
    () =>
      outputAmount && outputAmount.greaterThan('0') && inputAmount && currency0 && currency1
        ? new Price(currency0, currency1, inputAmount?.raw, outputAmount?.raw)
        : undefined,
    [currency0, currency1, inputAmount, outputAmount],
  );

  return useMemo(
    () => ({
      currency0,
      currency1,
      inputAmount,
      outputAmount,
      executionPrice,
    }),
    [currency0, currency1, inputAmount, outputAmount, executionPrice],
  );
}

export function useGelatoLimitOrderList() {
  const { open, executed, cancelled } = useGelatoLimitOrdersHistory();

  const openPending = useMemo(
    () =>
      (open.pending || []).map((item) => {
        const container = { ...item } as any;
        container['pending'] = true;
        return container;
      }),
    [open.pending],
  );

  const cancelledPending = useMemo(
    () =>
      (cancelled.pending || []).map((item) => {
        const container = { ...item } as any;
        container['pending'] = true;
        return container;
      }),
    [cancelled.pending],
  );

  const allOrders = useMemo(
    () => [...cancelledPending, ...openPending, ...open.confirmed, ...cancelled.confirmed, ...executed],
    [openPending, cancelledPending, open.confirmed, cancelled.confirmed, executed],
  );

  const allOpenOrders = useMemo(
    () => [...cancelledPending, ...openPending, ...open.confirmed],
    [openPending, cancelledPending, open.confirmed],
  );

  const allCancelledOrders = useMemo(() => cancelled.confirmed, [cancelled.confirmed]);

  return useMemo(
    () => ({
      allOrders,
      allOpenOrders,
      allCancelledOrders,
      executed,
    }),
    [allOrders, allOpenOrders, allCancelledOrders, executed],
  );
}

export function useDaasFeeTo(): [string, (feeTo: string) => void] {
  const chainId = useChainId();

  const dispatch = useDispatch();

  const state = useSelector<AppState['pswap']>((state) => state.pswap);

  const feeTo = state[chainId]?.feeTo;
  const setFeeTo = useCallback(
    (newFeeTo: string) => {
      dispatch(updateFeeTo({ feeTo: newFeeTo, chainId }));
    },
    [dispatch],
  );

  return [feeTo, setFeeTo];
}

export function useDaasFeeInfo(): [FeeInfo, (feeInfo: FeeInfo) => void] {
  const chainId = useChainId();

  const dispatch = useDispatch();

  const state = useSelector<AppState['pswap']>((state) => state.pswap);

  const feeInfo = state[chainId]?.feeInfo;

  const setFeeInfo = useCallback(
    (newFeeInfo: FeeInfo) => {
      dispatch(updateFeeInfo({ feeInfo: newFeeInfo, chainId }));
    },
    [dispatch],
  );

  return [feeInfo, setFeeInfo];
}
/* eslint-enable max-lines */
