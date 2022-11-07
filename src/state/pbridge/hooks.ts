/* eslint-disable max-lines */
import { parseUnits } from '@ethersproject/units';
import LIFI, { Route as LifiRoute } from '@lifi/sdk';
import {
  BridgeCurrency,
  Chain,
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  LIFI as LIFIBRIDGE,
  Token,
  TokenAmount,
} from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useCallback } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChainsAlternativeApproach } from 'src/hooks/bridge/Chains';
import { useBridgeCurrenciesAlternativeApproach } from 'src/hooks/bridge/Currencies';
import { useRoutes } from 'src/hooks/bridge/Routes';
import { AppState, useDispatch, useSelector } from 'src/state';
import { getSigner } from 'src/utils';
import { useCurrencyBalances } from '../pwallet/hooks';
import {
  ChainField,
  CurrencyField,
  TransactionStatus,
  changeRouteLoaderStatus,
  changeTransactionLoaderStatus,
  clearTransactionData,
  selectChain,
  selectCurrency,
  selectRoute,
  setRecipient,
  setRoutes,
  setTransactionError,
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
  onClearTransactionData: () => void;
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
          currencyId: currency?.symbol || '',
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

  const onClearTransactionData = useCallback(() => {
    dispatch(clearTransactionData());
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
    onClearTransactionData,
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
  selectedRoute?: Route;
  transactionLoaderStatus: boolean;
  transactionStatus?: TransactionStatus;
  transactionError?: Error;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { data } = useBridgeChainsAlternativeApproach();
  const bridgeCurrencies = useBridgeCurrenciesAlternativeApproach();

  const {
    typedValue,
    [CurrencyField.INPUT]: { currencyId: inputCurrencyId },
    [CurrencyField.OUTPUT]: { currencyId: outputCurrencyId },
    [ChainField.FROM]: { chainId: fromChainId },
    [ChainField.TO]: { chainId: toChainId },
    routes,
    recipient,
    routesLoaderStatus,
    transactionLoaderStatus,
    transactionStatus,
    transactionError,
  } = useBridgeState();

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
    selectedRoute,
    transactionLoaderStatus,
    transactionStatus,
    transactionError,
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
  sendTransaction: (
    library: any,
    // changeNetwork: (chain) => void,
    // toChain?: Chain,
    route?: Route,
    account?: string | null,
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

  const sendTransaction = async (
    library: any,
    // changeNetwork: (chain) => void,
    // toChain?: Chain,
    selectedRoute?: Route,
    account?: string | null,
  ) => {
    if (selectedRoute?.bridgeType === LIFIBRIDGE) {
      dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
      const lifi = new LIFI();

      //TODO: We're not using this for now.
      // const switchChainHook = () => {
      //   const data = {
      //     chainName: toChain?.name,
      //     nativeCurrency: {
      //       name: toChain?.nativeCurrency?.name,
      //       symbol: toChain?.nativeCurrency?.symbol,
      //       decimals: toChain?.nativeCurrency?.decimals,
      //     },
      //     blockExplorerUrls: toChain?.blockExplorerUrls,
      //     chainId: '0x' + Number(toChain?.chain_id)?.toString(16),
      //     rpcUrls: [toChain?.rpc_uri],
      //   };
      //   changeNetwork(data);
      // };

      const signer = await getSigner(library, account || '');
      // executing a route
      try {
        await lifi.executeRoute(signer as any, selectedRoute.nativeRoute as LifiRoute);
        dispatch(
          changeTransactionLoaderStatus({
            transactionLoaderStatus: false,
            transactionStatus: TransactionStatus.SUCCESS,
          }),
        );
      } catch (e: Error | unknown) {
        if (e) {
          dispatch(
            changeTransactionLoaderStatus({
              transactionLoaderStatus: false,
              transactionStatus: TransactionStatus.FAILED,
            }),
          );
          dispatch(setTransactionError({ transactionError: e as Error }));
        } else {
          dispatch(
            changeTransactionLoaderStatus({
              transactionLoaderStatus: false,
              transactionStatus: TransactionStatus.SUCCESS,
            }),
          );
        }
      }
    }
    // else if (selectedRoute?.bridgeType === THORSWAP) {
    //   const reqBody = {
    //     from:
    //       selectedRoute?.fromChainId +
    //       '.' +
    //       fromCurrency?.symbol +
    //       (fromCurrency?.address && fromCurrency?.address.length > 0 && fromCurrency?.address !== ZERO_ADDRESS
    //         ? '-' + fromCurrency?.address
    //         : ''),
    //     to:
    //       selectedRoute?.toChainId +
    //       '.' +
    //       toCurrency?.symbol +
    //       (toCurrency?.address && toCurrency?.address.length > 0 && toCurrency?.address !== ZERO_ADDRESS
    //         ? '-' + toCurrency?.address
    //         : ''),
    //     address: selectedRoute?.toAddress,
    //     amount: selectedRoute?.fromAmount,
    //     slippage: slippageTolerance,
    //     // affiliateFee: THORSWAP?.fee,
    //     // affiliateAddress: THORSWAP?.affiliate,
    //   };
    //   const reqSettings = {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(reqBody),
    //   };

    //   const response = await fetch(`${THORSWAP_API}/universal/transaction`, reqSettings);
    //   console.log('Thorswap: ', response);
    // }
  };
  return {
    getRoutes,
    sendTransaction,
  };
}
