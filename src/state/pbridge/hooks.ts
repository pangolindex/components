/* eslint-disable max-lines */
import { JsonRpcSigner } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import LIFI from '@lifi/sdk';
import { Route as LifiRoute, Step as LifiStep, RouteOptions, RoutesRequest, isLifiStep } from '@lifi/types';
import {
  BRIDGES,
  Bridge,
  BridgeCurrency,
  Chain,
  Currency,
  CurrencyAmount,
  LIFI as LIFIBridge,
  SQUID,
  THORSWAP,
  Token,
  TokenAmount,
} from '@pangolindex/sdk';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { THORSWAP_API, ZERO_ADDRESS } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
import { ThorswapRoute } from 'src/hooks/bridge/thorswap/types';
import { AppState, useDispatch, useSelector } from 'src/state';
import { calculateTransactionTime, getSigner } from 'src/utils';
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
import { BridgePrioritizations, Route, SendTransaction } from './types';

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
  onClearTransactionData: (transactionStatus: TransactionStatus) => void;
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

  const onClearTransactionData = useCallback(
    (transactionStatus?: TransactionStatus) => {
      dispatch(clearTransactionData());
      if (transactionStatus === TransactionStatus.SUCCESS) {
        dispatch(setRoutes({ routes: [], routesLoaderStatus: false }));
      }
    },
    [dispatch],
  );

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

export function tryParseAmount(value?: string, currency?: BridgeCurrency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed && Number(typedValueParsed) !== 0) {
      return new TokenAmount(currency as Currency as Token, typedValueParsed);
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
  estimatedAmount?: CurrencyAmount;
  amountNet?: string;
  recipient?: string | null;
  routesLoaderStatus?: boolean;
  selectedRoute?: Route;
  transactionLoaderStatus: boolean;
  transactionStatus?: TransactionStatus;
  transactionError?: Error;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const [chainList, setChainList] = useState<Chain[]>([]);
  const [currencyList, setCurrencyList] = useState<BridgeCurrency[]>([]);

  const chainHook = useBridgeChains();
  const currencyHook = useBridgeCurrencies();

  useEffect(() => {
    let data: BridgeCurrency[] = [];
    BRIDGES.map((bridge: Bridge) => {
      if (currencyHook?.[bridge.id]) {
        data = data
          ?.concat(currencyHook?.[bridge.id])
          ?.filter(
            (val, index, self) =>
              index === self.findIndex((t) => t?.symbol === val?.symbol && t?.chainId === val?.chainId),
          );
        setCurrencyList(data || []);
      }
    });
  }, [currencyHook?.[LIFIBridge.id], currencyHook?.[THORSWAP.id]]);

  useEffect(() => {
    let data: Chain[] = [];
    BRIDGES.map((bridge: Bridge) => {
      if (chainHook?.[bridge.id]) {
        data = data
          ?.concat(chainHook?.[bridge.id])
          ?.filter((val, index, self) => index === self.findIndex((t) => t?.chain_id === val?.chain_id));

        setChainList(data || []);
      }
    });
  }, [chainHook?.[LIFIBridge.id], chainHook?.[THORSWAP.id], chainHook?.[SQUID.id]]);

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

  const fromChain = fromChainId ? chainList?.find((x) => x.id === fromChainId) : undefined;
  const toChain = toChainId ? chainList?.find((x) => x.id === toChainId) : undefined;

  const inputCurrency =
    currencyList &&
    currencyList?.find(
      (x) => x?.symbol === inputCurrencyId && fromChain && x?.chainId === fromChain?.chain_id?.toString(),
    );
  const outputCurrency =
    currencyList &&
    currencyList?.find(
      (x) => x?.symbol === outputCurrencyId && toChainId && x?.chainId === toChain?.chain_id?.toString(),
    );

  // TODO: Maybe debank?
  const relevantTokenBalances = useCurrencyBalances(chainId, account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);
  const currencyBalances = {
    [CurrencyField.INPUT]: relevantTokenBalances[0],
    [CurrencyField.OUTPUT]: relevantTokenBalances[1],
  };

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined);
  const selectedRoute = routes?.find((x: Route) => x.selected);
  const estimatedAmount = tryParseAmount(selectedRoute?.toAmount, outputCurrency ?? undefined);
  const amountNet = selectedRoute?.toAmountNet.toString();

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

function feeCalculator(pValue, cValue) {
  let fee = 0;
  cValue.map((fields) => {
    fee = fee + fields?.totalFeeUSD;
  });
  fee = fee + pValue;
  return parseFloat(fee?.toString()).toFixed(4);
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
  sendTransaction: SendTransaction;
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
    } else {
      const parsedAmount = parseUnits(amount, fromCurrency?.decimals).toString();
      const lifi = new LIFI();

      const routeOptions: RouteOptions = {
        slippage: parseFloat(slipLimit) / 100,
        infiniteApproval: infiniteApproval,
        allowSwitchChain: false,
        // integrator: 'FROM SDK', //TODO:
        // fee: Number('FROM SDK'), //TODO:
      };

      const routesRequest: RoutesRequest = {
        fromChainId: fromChain?.chain_id || 1,
        fromAmount: parsedAmount,
        fromAddress: fromAddress || undefined,
        toAddress: fromAddress || undefined,
        fromTokenAddress: fromCurrency?.address || '',
        toChainId: toChain?.chain_id || 1,
        toTokenAddress: toCurrency?.address || '',
        options: routeOptions,
      };

      let routesResponse;
      try {
        routesResponse = await lifi.getRoutes(routesRequest);
      } catch (error) {
        routesResponse = {};
      }
      const routes = routesResponse?.routes || [];
      const lifiRoutes: Route[] = routes?.map((route) => {
        return {
          nativeRoute: route,
          bridgeType: LIFIBridge,
          waitingTime: calculateTransactionTime(
            route?.steps?.reduce((prevValue, currenctValue) => {
              return prevValue + currenctValue?.estimate?.executionDuration;
            }, 0),
          ),
          toToken: toCurrency?.symbol || '',
          toAmount: new TokenAmount(toCurrency as Currency as Token, route?.toAmount).toFixed(4),
          toAmountNet: new TokenAmount(toCurrency as Currency as Token, route?.toAmountMin).toFixed(4),
          toAmountUSD: `${route?.toAmountUSD} USD`,
          gasCostUSD: route?.gasCostUSD,
          steps: route?.steps?.map((step: LifiStep) => {
            return {
              bridge: LIFIBridge,
              type: step?.type,
              ...(isLifiStep(step) && {
                includedSteps: step?.includedSteps.map((subStep: LifiStep) => {
                  return {
                    type: subStep?.type,
                    integrator: subStep.tool,
                    action: {
                      toToken: subStep?.action?.toToken?.symbol,
                    },
                    estimate: {
                      toAmount: new TokenAmount(subStep?.action?.toToken as Token, subStep?.estimate?.toAmount).toFixed(
                        4,
                      ),
                    },
                  };
                }),
              }),
              action: {
                toToken: step?.action?.toToken?.symbol,
              },
              estimate: {
                toAmount: new TokenAmount(step?.action?.toToken as Token, step?.estimate?.toAmount).toFixed(4),
              },
            };
          }),
          transactionType:
            route?.tags && route?.tags.length > 0
              ? BridgePrioritizations[route?.tags?.[0].toUpperCase()]
              : BridgePrioritizations.NORMAL,
          selected: false,
        };
      });

      const thorswapReqParams = {
        sellAsset:
          fromChain?.symbol +
          '.' +
          fromCurrency?.symbol +
          (fromCurrency?.address && fromCurrency?.address.length > 0 && fromCurrency?.address !== ZERO_ADDRESS
            ? '-' + fromCurrency?.address
            : ''),
        buyAsset:
          toChain?.symbol +
          '.' +
          toCurrency?.symbol +
          (toCurrency?.address && toCurrency?.address.length > 0 && toCurrency?.address !== ZERO_ADDRESS
            ? '-' + toCurrency?.address
            : ''),
        sellAmount: amount,
        slippage: slipLimit,
        senderAddress: fromAddress || '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0', // We have to send an address, so we are using a placeholder address
        recipientAddress: recipient || fromAddress || '',
        // affiliateAddress: THORSWAP?.affiliate, //TODO:
        // affiliateBasisPoints: THORSWAP?.fee, //TODO:
      };

      const result = await axios
        .get(`${THORSWAP_API}/aggregator/tokens/quote`, { params: thorswapReqParams })
        .then((res) => {
          return res.data;
        })
        .catch(() => {
          return {};
        });

      const thorswapRoutes: Route[] =
        result?.routes
          ?.map((route: ThorswapRoute) => {
            return {
              bridgeType: THORSWAP,
              waitingTime: calculateTransactionTime(result?.estimatedTime),
              toToken: toCurrency?.symbol || '',
              toAmount: parseFloat(route?.expectedOutput).toFixed(4),
              toAmountNet: parseFloat(route?.expectedOutputMaxSlippage).toFixed(4),
              toAmountUSD: `${parseFloat(route?.expectedOutput).toFixed(4)} USD`,
              gasCostUSD: Object.values(route?.fees as any)?.reduce(feeCalculator, 0),
              steps: [
                {
                  bridge: THORSWAP,
                  type: 'bridge',
                  includedSteps: Object.values(route?.swaps).map((value) => {
                    return {
                      type: 'swap',
                      integrator: value?.[0]?.[0]?.parts?.[0]?.provider || 'Thorswap',
                      action: {
                        toToken: toCurrency?.symbol || '',
                      },
                      estimate: {
                        toAmount: `${parseFloat(route?.expectedOutputMaxSlippage).toFixed(4)}`,
                      },
                    };
                  }),
                },
              ],
              transactionType: route?.optimal ? BridgePrioritizations.RECOMMENDED : BridgePrioritizations.NORMAL,
              selected: route?.optimal ? true : false,
              nativeRoute: route,
            };
          })
          ?.sort((a, b) => b.selected - a.selected) || [];
      dispatch(setRoutes({ routes: [...thorswapRoutes, ...lifiRoutes], routesLoaderStatus: false }));
    }
  };

  const sendTransactionLifi = async (
    library: any,
    // changeNetwork: (chain) => void,
    // toChain?: Chain,
    selectedRoute?: Route,
    account?: string | null,
  ) => {
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

    const signer: JsonRpcSigner = await getSigner(library, account || '');
    // executing a route
    try {
      await lifi.executeRoute(signer as any, selectedRoute?.nativeRoute as LifiRoute);
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
  };

  // TODO:
  const sendTransactionThorswap = async (
    library: any,
    // changeNetwork: (chain) => void,
    // toChain?: Chain,
    selectedRoute?: Route,
    account?: string | null,
  ) => {
    console.log(library, selectedRoute, account);
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

  const sendTransaction = {
    lifi: sendTransactionLifi,
    thorswap: sendTransactionThorswap,
  };

  return {
    getRoutes,
    sendTransaction,
  };
}
