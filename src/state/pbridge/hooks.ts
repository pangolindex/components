/* eslint-disable max-lines */
import { Call, GetRoute, RouteResponse, Route as SquidRoute, RouteData as SquidRouteData } from '@0xsquid/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import LIFI from '@lifi/sdk';
import { Route as LifiRoute, Step as LifiStep, RouteOptions, RoutesRequest, isLifiStep } from '@lifi/types';
import {
  BRIDGES,
  Bridge,
  BridgeChain,
  BridgeCurrency,
  Chain,
  Currency,
  CurrencyAmount,
  LIFI as LIFIBridge,
  SQUID,
  Token,
  TokenAmount,
} from '@pangolindex/sdk';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { SQUID_API } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
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
import { BridgePrioritizations, GetRoutes, Route, SendTransaction, Step } from './types';

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
  chains: { [field in ChainField]?: BridgeChain };
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
  const [chainList, setChainList] = useState<BridgeChain[]>([]);
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
  }, [currencyHook?.[LIFIBridge.id], currencyHook?.[SQUID.id]]);

  useEffect(() => {
    let data: BridgeChain[] = [];
    BRIDGES.map((bridge: Bridge) => {
      if (chainHook?.[bridge.id]) {
        data = data
          ?.concat(chainHook?.[bridge.id])
          ?.filter((val, index, self) => index === self.findIndex((t) => t?.chain_id === val?.chain_id));

        setChainList(data || []);
      }
    });
  }, [chainHook?.[LIFIBridge.id], chainHook?.[SQUID.id]]);

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

  const chains: { [field in ChainField]?: BridgeChain } = {
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
  getRoutes: GetRoutes;
  sendTransaction: SendTransaction;
} {
  const dispatch = useDispatch();
  const getRoutes = async (
    amount: string,
    slipLimit: string,
    fromChain?: BridgeChain,
    toChain?: BridgeChain,
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
        allowSwitchChain: false,
      };

      const routesRequest: RoutesRequest = {
        fromChainId: (fromChain?.chain_id as number) || 1,
        fromAmount: parsedAmount,
        fromAddress: fromAddress || undefined,
        toAddress: fromAddress || undefined,
        fromTokenAddress: fromCurrency?.address || '',
        toChainId: (toChain?.chain_id as number) || 1,
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

      const params: GetRoute = {
        fromChain: fromChain?.chain_id || 1,
        fromToken:
          fromCurrency?.address
            ?.toString()
            ?.replace('0x0000000000000000000000000000000000000000', '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') || '',
        fromAmount: parsedAmount,
        toChain: toChain?.chain_id || 1,
        toToken:
          toCurrency?.address
            ?.toString()
            ?.replace('0x0000000000000000000000000000000000000000', '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') || '',
        toAddress: recipient || fromAddress || '0x0000000000000000000000000000000000000000', // the recipient's address
        slippage: parseFloat(slipLimit), // 3 --> 3.00% slippage. SDK supports 2 decimals
        enableForecall: true, // optional, defaults to true
      };

      let squidRouteRes: RouteResponse | null;
      try {
        const squidRoutes = await axios.get(`${SQUID_API}/route`, {
          params: params,
        });
        squidRouteRes = squidRoutes.data;
      } catch (error) {
        squidRouteRes = null;
      }

      const squidRoute: Route | undefined = squidRouteRes?.route
        ? {
            nativeRoute: squidRouteRes.route as SquidRouteData,
            bridgeType: SQUID,
            waitingTime: calculateTransactionTime(squidRouteRes.route.estimate.estimatedRouteDuration),
            toToken: toCurrency?.symbol || '',
            toAmount: new TokenAmount(toCurrency as Currency as Token, squidRouteRes.route.estimate.toAmount).toFixed(
              4,
            ),
            toAmountNet: new TokenAmount(
              toCurrency as Currency as Token,
              squidRouteRes.route.estimate.toAmountMin,
            ).toFixed(4),
            toAmountUSD: `${'NULL'} USD`,
            gasCostUSD: squidRouteRes.route.estimate.gasCosts
              .reduce((prevValue, currentValue) => {
                return prevValue + parseFloat(currentValue.amountUSD);
              }, 0)
              .toFixed(2),
            steps: [
              {
                bridge: SQUID,
                type: 'bridge',
                includedSteps: [
                  ...squidStepGenerator(
                    squidRouteRes.route.estimate.route.fromChain,
                    toCurrency,
                    squidRouteRes.route.estimate.toAmount,
                  ),
                  ...squidStepGenerator(
                    squidRouteRes.route.estimate.route.toChain,
                    toCurrency,
                    squidRouteRes.route.estimate.toAmount,
                  ),
                ],
                action: {
                  toToken: toCurrency?.symbol || '',
                },
                estimate: {
                  toAmount: new TokenAmount(
                    toCurrency as Currency as Token,
                    squidRouteRes.route.estimate.toAmount,
                  ).toFixed(4),
                },
              },
            ],
            transactionType: BridgePrioritizations.RECOMMENDED,
            selected: false,
          }
        : undefined;

      dispatch(
        setRoutes({
          routes: [...lifiRoutes, squidRoute].filter((x: Route | undefined) => x !== undefined) as Route[],
          routesLoaderStatus: false,
        }),
      );
    }
  };

  const squidStepGenerator = (route: SquidRoute, toCurrency, toAmount): Step[] => {
    return route.map((step: Call) => {
      if ('dex' in step) {
        // SWAP
        return {
          type: step.type,
          integrator: step.dex.dexName,
          action: {
            toToken: step.toToken.symbol,
          },
          estimate: {
            toAmount: new TokenAmount(step?.toToken as unknown as Token, step?.toAmount).toFixed(4),
          },
        };
      } else if ('callType' in step) {
        //CUSTOMCALL
        return {
          type: step.type,
          integrator: 'Squid',
          action: {
            toToken: toCurrency?.symbol || '',
          },
          estimate: {
            toAmount: new TokenAmount(toCurrency as Currency as Token, toAmount).toFixed(4),
          },
        };
      } else {
        // BRIDGE
        return {
          type: step.type,
          integrator: 'Squid',
          action: {
            toToken: step.toToken.symbol,
          },
          estimate: {
            toAmount: new TokenAmount(step.toToken as unknown as Token, step.toAmount).toFixed(4),
          },
        };
      }
    });
  };

  const sendTransactionLifi = async (library: any, selectedRoute?: Route, account?: string | null) => {
    dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
    const lifi = new LIFI();

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

  const sendTransactionSquid = async (library: any, selectedRoute?: Route, account?: string | null) => {
    dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
    const signer: JsonRpcSigner = await getSigner(library, account || '');
    const squidRoute = selectedRoute?.nativeRoute as SquidRouteData;
    console.log(signer, squidRoute);
    // async () => {
    //   console.log('test');
    // const squid = new Squid({
    //   baseUrl: 'https://api.0xsquid.com',
    // });
    //   console.log('test 1');
    //   await squid.init();
    //   console.log('test 2');
    //   const tx = await squid.executeRoute({
    //     signer: signer as any,
    //     route: squidRoute,
    //   });

    //   const txReceipt = await tx.wait();
    //   console.log(txReceipt);
    // };
  };

  const sendTransaction: SendTransaction = {
    lifi: sendTransactionLifi,
    squid: sendTransactionSquid,
  };

  return {
    getRoutes,
    sendTransaction,
  };
}
