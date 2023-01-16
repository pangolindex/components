/* eslint-disable max-lines */
import { Call, GetRoute, RouteResponse, Squid, Route as SquidRoute, RouteData as SquidRouteData } from '@0xsquid/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import LIFI from '@lifi/sdk';
import { Route as LifiRoute, Step as LifiStep, RouteOptions, RoutesRequest, isLifiStep } from '@lifi/types';
import {
  ALL_CHAINS,
  BRIDGES,
  Bridge,
  BridgeChain,
  BridgeCurrency,
  Chain,
  Currency,
  CurrencyAmount,
  HASHPORT,
  LIFI as LIFIBridge,
  SQUID,
  Token,
  TokenAmount,
} from '@pangolindex/sdk';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { COINGEKO_BASE_URL, HASHPORT_API, SQUID_API } from 'src/constants';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
import { AppState, useDispatch, useSelector } from 'src/state';
import { calculateTransactionTime, changeNetwork, formatDate, getSigner } from 'src/utils';
import { useCurrencyBalances } from '../pwallet/hooks';
import {
  ChainField,
  CurrencyField,
  TransactionStatus,
  addBridgeTransfer,
  changeRouteLoaderStatus,
  changeTransactionLoaderStatus,
  changeTransferStatus,
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
  updateBridgeTransferIfExist,
} from './actions';
import {
  BridgePrioritizations,
  BridgeTransfer,
  BridgeTransferStatus,
  GetRoutes,
  ResumeTransaction,
  Route,
  SendTransaction,
  Step,
} from './types';

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
  transfers?: BridgeTransfer[]; // TODO: Transfer
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
  }, [currencyHook?.[LIFIBridge.id], currencyHook?.[SQUID.id], currencyHook?.[HASHPORT.id]]);

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
  }, [chainHook?.[LIFIBridge.id], chainHook?.[SQUID.id], chainHook?.[HASHPORT.id]]);

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
    transfers,
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
    transfers,
  };
}

export function useBridgeSwapActionHandlers(): {
  getRoutes: GetRoutes;
  sendTransaction: SendTransaction;
  resumeTransaction: ResumeTransaction;
} {
  const dispatch = useDispatch();
  const { library } = useLibrary();
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
        allowSwitchChain: true,
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
          id: route.id,
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
          fromAmount: amount,
          fromChain: fromChain as BridgeChain,
          fromCurrency: fromCurrency as BridgeCurrency,
          toChain: toChain as BridgeChain,
          toCurrency: toCurrency as BridgeCurrency,
        };
      });

      const params: Omit<GetRoute, 'toAddress'> & Partial<Pick<GetRoute, 'toAddress'>> = {
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
        ...((recipient || fromAddress) && { toAddress: recipient || fromAddress || '' }),
        slippage: parseFloat(slipLimit),
        enableForecall: true,
        quoteOnly: recipient || fromAddress ? false : true,
      };

      let squidRouteRes: RouteResponse | null;
      try {
        const squidRoutes = await axios.get(`${SQUID_API}/v1/route`, {
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
            toAmountUSD: `${squidRouteRes.route.estimate?.toAmountUSD} USD`,
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
            fromAmount: amount,
            fromChain: fromChain as BridgeChain,
            fromCurrency: fromCurrency as BridgeCurrency,
            toChain: toChain as BridgeChain,
            toCurrency: toCurrency as BridgeCurrency,
          }
        : undefined;

      let hashportRoute: Route | undefined;
      try {
        const assetDetailReq = await axios.get(
          `${HASHPORT_API}/networks/${fromChain?.chain_id}/assets/${fromCurrency?.address?.toString()}`,
        );
        const assetDetail = assetDetailReq.data;
        if (assetDetail) {
          const hederaGasFeeUSD = 0.0001; // https://docs.hedera.com/hedera/mainnet/fees
          const toAmountFee =
            (parseFloat(parsedAmount) * (assetDetail.feePercentage.amount / assetDetail.feePercentage.maxPercentage)) /
            10 ** assetDetail.decimals;
          const toAmount = (parseFloat(amount) - toAmountFee).toFixed(4);

          const url = `${COINGEKO_BASE_URL}/simple/token_price/${
            toChain?.coingecko_id
          }?contract_addresses=${toCurrency?.address.toLowerCase()}&vs_currencies=usd`;
          const response = await fetch(url);
          const data = await response.json();
          const toCurrencyUSD = toCurrency && data[toCurrency?.address.toLowerCase()]?.usd;
          const toAmountUSD = toCurrencyUSD && (toCurrencyUSD * parseFloat(toAmount)).toFixed(4);

          hashportRoute = {
            bridgeType: HASHPORT,
            toToken: toCurrency?.symbol || '',
            toAmount: toAmount,
            toAmountNet: toAmount,
            recipient: recipient,
            ...(toAmountUSD && { toAmountUSD: `${toAmountUSD} USD` }),
            gasCostUSD: hederaGasFeeUSD.toString(), // TODO: Add target chain gas cost
            steps: [
              {
                bridge: HASHPORT,
                type: 'bridge',
                includedSteps: [
                  {
                    type: 'cross',
                    integrator: HASHPORT.name,
                    action: {
                      toToken: toCurrency?.symbol || '',
                    },
                    estimate: {
                      toAmount: toAmount,
                    },
                  },
                ],
                action: {
                  toToken: toCurrency?.symbol || '',
                },
                estimate: {
                  toAmount: toAmount,
                },
              },
            ],
            transactionType: BridgePrioritizations.RECOMMENDED,
            selected: false,
            minAmount: (assetDetail.minAmount / 10 ** assetDetail.decimals).toString(),
            fromAmount: amount,
            fromChain: fromChain as BridgeChain,
            fromCurrency: fromCurrency as BridgeCurrency,
            toChain: toChain as BridgeChain,
            toCurrency: toCurrency as BridgeCurrency,
          };
        } else {
          hashportRoute = undefined;
        }
      } catch (error) {
        hashportRoute = undefined;
      }

      dispatch(
        setRoutes({
          routes: [...lifiRoutes, squidRoute, hashportRoute].filter(
            (x: Route | undefined) => x !== undefined,
          ) as Route[],
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

  const switchNetwork = async (toChain: Chain, account?: string | null) => {
    // TODO: Li.Fi throws an error when it tries to switch the network.
    await changeNetwork(toChain);
    const signer = getSigner(library, account || '') as any;
    return signer;
  };

  const sendTransactionLifi = async (selectedRoute: Route, account?: string | null) => {
    dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
    const lifi = new LIFI();
    const toChain: Chain = ALL_CHAINS.filter(
      (chain) => chain.chain_id === (selectedRoute?.nativeRoute as LifiRoute)?.toChainId,
    )[0];

    const transfer: BridgeTransfer = {
      id: selectedRoute?.id,
      date: formatDate(new Date()),
      fromAmount: selectedRoute.fromAmount,
      fromChain: selectedRoute.fromChain,
      fromCurrency: selectedRoute.fromCurrency,
      toAmount: selectedRoute.toAmount || '',
      toChain: selectedRoute.toChain,
      toCurrency: selectedRoute.toCurrency,
      bridgeProvider: selectedRoute?.bridgeType,
      status: BridgeTransferStatus.PENDING,
      nativeRoute: selectedRoute?.nativeRoute,
    };

    const signer: JsonRpcSigner = await getSigner(library, account || '');
    const containsSwitchChain = selectedRoute?.steps?.length > 1;
    try {
      if (containsSwitchChain) {
        dispatch(
          addBridgeTransfer({
            transfer,
          }),
        );
      }
      await lifi.executeRoute(signer as any, selectedRoute?.nativeRoute as LifiRoute, {
        updateCallback: async (updatedRoute: LifiRoute) => {
          const clonedTransfer = JSON.parse(JSON.stringify(transfer));
          const clonedNativeRoute = JSON.parse(JSON.stringify(updatedRoute));
          clonedTransfer.nativeRoute = clonedNativeRoute;
          dispatch(
            updateBridgeTransferIfExist({
              transfer: clonedTransfer,
              id: updatedRoute.id,
            }),
          );
        },
        switchChainHook: () => switchNetwork(toChain, account),
      });
      dispatch(
        changeTransactionLoaderStatus({
          transactionLoaderStatus: false,
          transactionStatus: TransactionStatus.SUCCESS,
        }),
      );
      transfer.status = BridgeTransferStatus.SUCCESS;
      if (containsSwitchChain) {
        dispatch(updateBridgeTransferIfExist({ transfer, id: transfer.id as string }));
      } else {
        dispatch(
          addBridgeTransfer({
            transfer,
          }),
        );
      }
    } catch (e: Error | unknown) {
      if (e) {
        dispatch(
          changeTransactionLoaderStatus({
            transactionLoaderStatus: false,
            transactionStatus: TransactionStatus.FAILED,
          }),
        );
        dispatch(setTransactionError({ transactionError: e as Error }));
        if (!containsSwitchChain) {
          transfer.status = BridgeTransferStatus.FAILED;
          transfer.errorMessage = (e as Error).message;
          dispatch(
            addBridgeTransfer({
              transfer,
            }),
          );
        }
      } else {
        dispatch(
          changeTransactionLoaderStatus({
            transactionLoaderStatus: false,
            transactionStatus: TransactionStatus.SUCCESS,
          }),
        );
        transfer.status = BridgeTransferStatus.SUCCESS;
        if (containsSwitchChain) {
          dispatch(updateBridgeTransferIfExist({ transfer, id: transfer.id as string }));
        } else {
          dispatch(
            addBridgeTransfer({
              transfer,
            }),
          );
        }
      }
    }
  };

  const sendTransactionSquid = async (selectedRoute: Route, account?: string | null) => {
    dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
    const signer: JsonRpcSigner = await getSigner(library, account || '');
    const squidRoute = selectedRoute?.nativeRoute as SquidRouteData;
    const squid = new Squid({
      baseUrl: SQUID_API,
    });
    await squid.init();

    const transfer: BridgeTransfer = {
      date: formatDate(new Date()),
      fromAmount: selectedRoute.fromAmount,
      fromChain: selectedRoute.fromChain,
      fromCurrency: selectedRoute.fromCurrency,
      toAmount: selectedRoute.toAmount || '',
      toChain: selectedRoute.toChain,
      toCurrency: selectedRoute.toCurrency,
      bridgeProvider: selectedRoute?.bridgeType,
      status: BridgeTransferStatus.PENDING,
      nativeRoute: selectedRoute?.nativeRoute,
    };

    try {
      const tx = await squid.executeRoute({
        signer: signer as any,
        route: squidRoute,
      });
      await tx.wait();
      dispatch(
        changeTransactionLoaderStatus({
          transactionLoaderStatus: false,
          transactionStatus: TransactionStatus.SUCCESS,
        }),
      );
      transfer.status = BridgeTransferStatus.SUCCESS;
      dispatch(
        addBridgeTransfer({
          transfer,
        }),
      );
    } catch (e: Error | unknown) {
      dispatch(
        changeTransactionLoaderStatus({
          transactionLoaderStatus: false,
          transactionStatus: TransactionStatus.FAILED,
        }),
      );
      dispatch(setTransactionError({ transactionError: e as Error }));
      transfer.status = BridgeTransferStatus.FAILED;
      transfer.errorMessage = (e as Error).message;
      dispatch(
        addBridgeTransfer({
          transfer,
        }),
      );
    }
  };

  const sendTransactionHashport = async (selectedRoute: Route, account?: string | null) => {
    dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
    const transfer: BridgeTransfer = {
      date: formatDate(new Date()),
      fromAmount: selectedRoute.fromAmount,
      fromChain: selectedRoute.fromChain,
      fromCurrency: selectedRoute.fromCurrency,
      toAmount: selectedRoute.toAmount || '',
      toChain: selectedRoute.toChain,
      toCurrency: selectedRoute.toCurrency,
      bridgeProvider: selectedRoute?.bridgeType,
      status: BridgeTransferStatus.PENDING,
      nativeRoute: selectedRoute?.nativeRoute,
    };
    try {
      // TODO:
      console.log(account);
      // const signer: JsonRpcSigner = await getSigner(library, account || '');

      // Step 1 - Validate Porting Steps

      const params = {
        sourceNetworkId: selectedRoute.fromChain?.chain_id,
        sourceAssetId: selectedRoute.fromCurrency?.address,
        targetNetworkId: selectedRoute.toChain?.chain_id,
        recipient: selectedRoute.recipient,
        amount: parseFloat(selectedRoute.fromAmount) * 10 ** selectedRoute.fromCurrency?.decimals,
      };
      const validationReq = await axios.get(`${HASHPORT_API}/bridge/validate`, {
        params,
      });
      const validationRes = validationReq.data;
      if (!validationRes.valid) {
        dispatch(
          changeTransactionLoaderStatus({
            transactionLoaderStatus: false,
            transactionStatus: TransactionStatus.FAILED,
          }),
        );
        dispatch(setTransactionError({ transactionError: new Error('Route is not valid') }));
        transfer.status = BridgeTransferStatus.FAILED;
        transfer.errorMessage = 'Route is not valid';
        dispatch(
          addBridgeTransfer({
            transfer,
          }),
        );
        return;
      }
      // Step 2 - Get bridge steps
      // Step 3 - Run each step
      // Step 4 - Switch Chain
      // Step 5 - Continue to next step
    } catch (error: Error | unknown) {
      dispatch(
        changeTransactionLoaderStatus({
          transactionLoaderStatus: false,
          transactionStatus: TransactionStatus.FAILED,
        }),
      );
      dispatch(setTransactionError({ transactionError: error as Error }));
      transfer.status = BridgeTransferStatus.FAILED;
      transfer.errorMessage = (error as Error).message;
      dispatch(
        addBridgeTransfer({
          transfer,
        }),
      );
    }
  };

  const resumeTransactionLifi = async (transfer: BridgeTransfer, account?: string | null) => {
    dispatch(changeTransactionLoaderStatus({ transactionLoaderStatus: true, transactionStatus: undefined }));
    const lifi = new LIFI();
    const toChain: Chain = ALL_CHAINS.filter(
      (chain) => chain.chain_id === (transfer?.nativeRoute as LifiRoute)?.toChainId,
    )[0];
    const signer: JsonRpcSigner = await getSigner(library, account || '');

    try {
      await lifi.resumeRoute(signer as any, transfer?.nativeRoute as LifiRoute, {
        updateCallback: async (updatedRoute: LifiRoute) => {
          const clonedTransfer = JSON.parse(JSON.stringify(transfer));
          const clonedNativeRoute = JSON.parse(JSON.stringify(updatedRoute));
          clonedTransfer.nativeRoute = clonedNativeRoute;
          dispatch(
            updateBridgeTransferIfExist({
              transfer: clonedTransfer,
              id: updatedRoute.id,
            }),
          );
        },
        switchChainHook: () => switchNetwork(toChain, account),
      });
      dispatch(
        changeTransactionLoaderStatus({
          transactionLoaderStatus: false,
          transactionStatus: TransactionStatus.SUCCESS,
        }),
      );
      dispatch(changeTransferStatus({ status: BridgeTransferStatus.SUCCESS, id: transfer.id as string }));
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
        dispatch(changeTransferStatus({ status: BridgeTransferStatus.SUCCESS, id: transfer.id as string }));
      }
    }
  };

  const sendTransaction: SendTransaction = {
    lifi: sendTransactionLifi,
    squid: sendTransactionSquid,
    hashport: sendTransactionHashport,
  };

  const resumeTransaction: ResumeTransaction = {
    lifi: resumeTransactionLifi,
  };

  return {
    getRoutes,
    sendTransaction,
    resumeTransaction,
  };
}
