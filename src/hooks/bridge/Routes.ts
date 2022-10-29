import { parseUnits } from '@ethersproject/units';
import LIFI from '@lifi/sdk';
import { Step as LifiStep, RouteOptions, RoutesRequest, isLifiStep } from '@lifi/types';
import { BridgeCurrency, Chain, Currency, LIFI as LIFIBRIDGE, THORSWAP, Token, TokenAmount } from '@pangolindex/sdk';
import React from 'react';
import { BRIDGE_THORSWAP_PROD, ZERO_ADDRESS } from 'src/constants';
import { BridgePrioritizations, Route } from 'src/state/pbridge/types';
import { calculateTransactionTime } from 'src/utils';
export async function useRoutes(
  amount: string,
  slipLimit: string,
  infiniteApproval?: boolean,
  fromChain?: Chain,
  toChain?: Chain,
  address?: string | null,
  fromCurrency?: BridgeCurrency,
  toCurrency?: BridgeCurrency,
  recipient?: string | null | undefined,
): Promise<Route[]> {
  const parsedAmount = parseUnits(amount, fromCurrency?.decimals).toString();
  const lifi = new LIFI();

  // https://docs.li.fi/integrate-li.fi-js-sdk/request-a-route/set-route-options
  const routeOptions: RouteOptions = {
    slippage: parseFloat(slipLimit) / 100, // 3%
    infiniteApproval: infiniteApproval,
    // allowSwitchChain: false,
  };

  const routesRequest: RoutesRequest = {
    fromChainId: fromChain?.chain_id || 1,
    fromAmount: parsedAmount,
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
      waitingTime: calculateTransactionTime(
        route?.steps?.reduce((prevValue, currenctValue) => {
          return prevValue + currenctValue?.estimate?.executionDuration;
        }, 0),
      ),
      fromChainId: fromChain?.id || '',
      fromAmount: amount,
      fromToken: fromCurrency?.symbol || '',
      toToken: toCurrency?.symbol || '',
      fromAddress: address || '',
      toChainId: toChain?.id || '',
      toAmount: new TokenAmount(toCurrency as Currency as Token, route?.toAmount).toFixed(4),
      toAmountNet: new TokenAmount(toCurrency as Currency as Token, route?.toAmountMin).toFixed(4),
      toAmountUSD: `${route?.toAmountUSD} USD`,
      toAddress: address || '',
      gasCostUSD: route?.gasCostUSD,
      steps: route?.steps?.map((step: LifiStep) => {
        return {
          bridge: LIFIBRIDGE,
          type: step?.type,
          ...(isLifiStep(step) && {
            includedSteps: step?.includedSteps.map((subStep: LifiStep) => {
              return {
                type: subStep?.type,
                integrator: subStep.tool,
                action: {
                  fromChainId: subStep?.action?.fromChainId,
                  fromAmount: new TokenAmount(subStep?.action?.fromToken as Token, subStep?.action?.fromAmount).toFixed(
                    4,
                  ),
                  fromToken: subStep?.action?.fromToken?.symbol,
                  toChainId: subStep?.action?.toChainId,
                  toToken: subStep?.action?.toToken?.symbol,
                  slippage: parseFloat(slipLimit) / 100,
                },
                estimate: {
                  fromAmount: new TokenAmount(
                    subStep?.action?.fromToken as Token,
                    subStep?.estimate?.fromAmount,
                  ).toFixed(4),
                  toAmount: new TokenAmount(subStep?.action?.toToken as Token, subStep?.estimate?.toAmount).toFixed(4),
                  toAmountMin: new TokenAmount(
                    subStep?.action?.toToken as Token,
                    subStep?.estimate?.toAmountMin,
                  ).toFixed(4),
                  approvalAddress: subStep?.estimate?.approvalAddress,
                  executionDuration: subStep?.estimate?.executionDuration,
                },
              };
            }),
          }),
          action: {
            fromChainId: step?.action?.fromChainId,
            fromToken: step?.action?.fromToken?.symbol,
            toToken: step?.action?.toToken?.symbol,
            fromAmount: new TokenAmount(step?.action?.fromToken as Token, step?.action?.fromAmount).toFixed(4),
            toChainId: step?.action?.toChainId,
            slippage: parseFloat(slipLimit) / 100,
          },
          estimate: {
            fromAmount: new TokenAmount(step?.action?.fromToken as Token, step?.estimate?.fromAmount).toFixed(4),
            toAmount: new TokenAmount(step?.action?.toToken as Token, step?.estimate?.toAmount).toFixed(4),
            toAmountMin: new TokenAmount(step?.action?.toToken as Token, step?.estimate?.toAmountMin).toFixed(4),
            approvalAddress: step?.estimate?.approvalAddress,
            executionDuration: step?.estimate?.executionDuration,
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

  const response = await fetch(
    `${BRIDGE_THORSWAP_PROD}/aggregator/tokens/quote?sellAsset=${
      fromChain?.symbol +
      '.' +
      fromCurrency?.symbol +
      (fromCurrency?.address && fromCurrency?.address.length > 0 && fromCurrency?.address !== ZERO_ADDRESS
        ? '-' + fromCurrency?.address
        : '')
    }&buyAsset=${
      toChain?.symbol +
      '.' +
      toCurrency?.symbol +
      (toCurrency?.address && toCurrency?.address.length > 0 && toCurrency?.address !== ZERO_ADDRESS
        ? '-' + toCurrency?.address
        : '')
    }&sellAmount=${amount}&slippage=${slipLimit}&senderAddress=${
      address || '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0' // We have to send an address, so we are using a placeholder address
    }&recipientAddress=${recipient || address || ''}`,
  );

  function feeCalculator(pValue, cValue) {
    let fee = 0;
    cValue.map((fields) => {
      fee = fee + fields?.totalFeeUSD;
    });
    fee = fee + pValue;
    return parseFloat(fee?.toString()).toFixed(4);
  }

  const result = response && response.status === 200 ? await response.json() : {};
  const thorswapRoutes: Route[] =
    result?.routes
      ?.map((route) => {
        return {
          memo: route?.calldata?.memo,
          waitingTime: calculateTransactionTime(result?.estimatedTime),
          fromChainId: fromChain?.id || '',
          fromAmount: amount,
          fromToken: fromCurrency?.symbol || '',
          toToken: toCurrency?.symbol || '',
          fromAddress: address || '',
          toChainId: toChain?.id || '',
          toAmount: parseFloat(route?.expectedOutput).toFixed(4),
          toAmountNet: parseFloat(route?.expectedOutputMaxSlippage).toFixed(4),
          toAmountUSD: `${parseFloat(route?.expectedOutput).toFixed(4)} USD`,
          toAddress: (!toChain?.evm && recipient) || address || '',
          gasCostUSD: Object.values(route?.fees)?.reduce(feeCalculator, 0),
          steps: [
            {
              bridge: THORSWAP,
              type: 'bridge',
              includedSteps: Object.values(route?.swaps).map((value) => {
                return {
                  type: 'swap',
                  integrator: value?.[0]?.[0]?.parts?.[0]?.provider || 'Thorswap',
                  action: {
                    fromChainId: value?.[0]?.[0].from?.split('.')?.[0],
                    fromToken: fromCurrency?.symbol || '', // TODO: We can't get this information from thorswap directly for each step
                    toToken: toCurrency?.symbol || '', // TODO: We can't get this information from thorswap directly for each step
                    fromAmount: amount,
                    toChainId: value?.[0]?.[0].to?.split('.')?.[0],
                    slippage: parseFloat(slipLimit),
                  },
                  estimate: {
                    fromAmount: amount,
                    toAmount: `${parseFloat(route?.expectedOutputMaxSlippage).toFixed(4)}`,
                    approvalAddress: 'XXXXXXXXXX', //TODO:
                    executionDuration: result?.estimatedTime,
                  },
                };
              }),
            },
          ],
          transactionType: route?.optimal ? BridgePrioritizations.RECOMMENDED : BridgePrioritizations.NORMAL,
          selected: route?.optimal ? true : false,
        };
      })
      ?.sort((a, b) => b.selected - a.selected) || [];
  return [...thorswapRoutes, ...lifiRoutes];
}
