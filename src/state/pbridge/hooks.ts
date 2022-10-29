import { parseUnits } from '@ethersproject/units';
import { BridgeCurrency, Chain, ChainId, Currency, CurrencyAmount, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChainsAlternativeApproach } from 'src/hooks/bridge/Chains';
import { useBridgeCurrenciesAlternativeApproach } from 'src/hooks/bridge/Currencies';
import { useRoutes } from 'src/hooks/bridge/Routes';
import { AppState, useDispatch, useSelector } from 'src/state';
import { useCurrencyBalances } from '../pwallet/hooks';
import {
  ChainField,
  CurrencyField,
  changeRouteLoaderStatus,
  selectChain,
  selectCurrency,
  selectRoute,
  setRecipient,
  setRoutes,
  switchChains,
  switchCurrencies,
  typeAmount,
} from './actions';
import { Route } from './types';

export function useBridgeState(): AppState['pbridge'] {
  return useSelector<AppState['pbridge']>((state) => state.pbridge);
}

export function useBridgeActionHandlers(): {
  onCurrencySelection: (field: CurrencyField, currency: BridgeCurrency) => void;
  onChainSelection: (field: ChainField, chain: Chain) => void;
  onSwitchTokens: () => void;
  onSelectRoute: (route: Route) => void;
  onSwitchChains: () => void;
  onUserInput: (field: CurrencyField, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
  onChangeRouteLoaderStatus: () => void;
} {
  const dispatch = useDispatch();
  const { routes, routesLoaderStatus } = useBridgeState();

  const onSelectRoute = (route: Route) => {
    const selectedRouteIndex = routes.findIndex((r) => r === route);
    dispatch(selectRoute({ selectedRoute: selectedRouteIndex }));
  };

  const onCurrencySelection = useCallback(
    (field: CurrencyField, currency: BridgeCurrency) => {
      dispatch(
        selectCurrency({
          field,
          //TODO: address? Let's say we have same symbol. How to distinguish them?
          currencyId: currency?.symbol || currency?.address || '',
        }),
      );
    },
    [dispatch],
  );

  const onChainSelection = useCallback(
    (field: ChainField, chain: Chain) => {
      dispatch(
        selectChain({
          field,
          chainId: chain ? chain.id : '',
        }),
      );
    },
    [dispatch],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onSwitchChains = useCallback(() => {
    dispatch(switchChains());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: CurrencyField, typedValue: string) => {
      dispatch(typeAmount({ field, typedValue }));
    },
    [dispatch],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch],
  );

  const onChangeRouteLoaderStatus = useCallback(() => {
    dispatch(changeRouteLoaderStatus({ routesLoaderStatus: !routesLoaderStatus }));
  }, [dispatch]);

  return {
    onSwitchTokens,
    onCurrencySelection,
    onChainSelection,
    onSwitchChains,
    onSelectRoute,
    onUserInput,
    onChangeRecipient,
    onChangeRouteLoaderStatus,
  };
}

export function tryParseAmount(
  value?: string,
  currency?: BridgeCurrency,
  chainId: ChainId = ChainId.AVALANCHE,
): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return (currency as Currency) instanceof Token
        ? new TokenAmount(currency as Currency as Token, typedValueParsed)
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed), chainId);
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

export function useDerivedBridgeInfo(): {
  currencies: { [field in CurrencyField]?: BridgeCurrency };
  chains: { [field in ChainField]?: Chain };
  currencyBalances: { [field in CurrencyField]?: CurrencyAmount };
  parsedAmount: CurrencyAmount | undefined;
  inputError?: string;
  routes?: Route[];
  estimatedAmount?: CurrencyAmount | undefined;
  amountNet?: string | undefined;
  recipient?: string | null;
  routesLoaderStatus?: boolean;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { data } = useBridgeChainsAlternativeApproach();
  const bridgeCurrencies = useBridgeCurrenciesAlternativeApproach();

  // select the current chain if it is supported by the bridge
  // const currentChain = data?.find((x) => x.chain_id?.toString() === chainId?.toString()) || undefined;
  const {
    typedValue,
    [CurrencyField.INPUT]: { currencyId: inputCurrencyId },
    [CurrencyField.OUTPUT]: { currencyId: outputCurrencyId },
    [ChainField.FROM]: { chainId: fromChainId },
    [ChainField.TO]: { chainId: toChainId },
    routes,
    recipient,
    routesLoaderStatus,
  } = useBridgeState();

  //TODO: need to put currentChain, but the currency list is not coming if we put it.
  const fromChain = fromChainId ? data?.find((x) => x.id === fromChainId) : undefined;
  const toChain = toChainId ? data?.find((x) => x.id === toChainId) : undefined;

  const inputCurrency =
    bridgeCurrencies &&
    bridgeCurrencies?.data?.find(
      (x) => x?.symbol === inputCurrencyId && fromChain && x?.chainId === fromChain?.chain_id?.toString(),
    );
  const outputCurrency =
    bridgeCurrencies &&
    bridgeCurrencies?.data?.find(
      (x) => x?.symbol === outputCurrencyId && toChainId && x?.chainId === toChain?.chain_id?.toString(),
    );

  const relevantTokenBalances = useCurrencyBalances(chainId, account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined, chainId);
  const selectedRoute = routes?.find((x: Route) => x.selected);
  const estimatedAmount = tryParseAmount(selectedRoute?.toAmount, outputCurrency ?? undefined, chainId);
  const amountNet = selectedRoute?.toAmountNet.toString();
  const currencyBalances = {
    [CurrencyField.INPUT]: relevantTokenBalances[0],
    [CurrencyField.OUTPUT]: relevantTokenBalances[1],
  };

  const currencies: { [field in CurrencyField]?: BridgeCurrency } = {
    [CurrencyField.INPUT]: inputCurrency ?? undefined,
    [CurrencyField.OUTPUT]: outputCurrency ?? undefined,
  };

  const chains: { [field in ChainField]?: Chain } = {
    [ChainField.FROM]: fromChain ?? undefined,
    [ChainField.TO]: toChain ?? undefined,
  };

  let inputError: string | undefined;
  if (!account) {
    inputError = 'Connect Wallet';
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount';
  }

  if (!currencies[CurrencyField.INPUT] || !currencies[CurrencyField.OUTPUT]) {
    inputError = inputError ?? 'Select a token';
  }

  if (!chains[ChainField.FROM] || !chains[ChainField.TO]) {
    inputError = inputError ?? 'Select a chain';
  }

  return {
    currencies,
    chains,
    currencyBalances,
    parsedAmount,
    inputError,
    routes,
    estimatedAmount,
    amountNet,
    recipient,
    routesLoaderStatus,
  };
}

export function useBridgeSwapActionHandlers(): {
  getRoutes: (
    amount: string,
    slipLimit: string,
    infiniteApproval?: boolean,
    fromChain?: Chain,
    toChain?: Chain,
    fromAddress?: string | null,
    fromCurrency?: BridgeCurrency,
    toCurrency?: BridgeCurrency,
    recipient?: string | null | undefined,
  ) => void;
} {
  const dispatch = useDispatch();
  const getRoutes = async (
    amount: string,
    slipLimit: string,
    infiniteApproval?: boolean,
    fromChain?: Chain,
    toChain?: Chain,
    fromAddress?: string | null,
    fromCurrency?: BridgeCurrency,
    toCurrency?: BridgeCurrency,
    recipient?: string | null | undefined,
  ) => {
    if (parseFloat(amount) <= 0) {
      dispatch(setRoutes({ routes: [], routesLoaderStatus: false }));
      return;
    } else {
      useRoutes(
        amount,
        slipLimit,
        infiniteApproval,
        fromChain,
        toChain,
        fromAddress,
        fromCurrency,
        toCurrency,
        recipient,
      ).then((routes: Route[]) => {
        dispatch(setRoutes({ routes, routesLoaderStatus: false }));
      });
    }
  };
  return {
    getRoutes,
  };
}
