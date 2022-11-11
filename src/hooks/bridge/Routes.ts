import { parseUnits } from '@ethersproject/units';
import LIFI from '@lifi/sdk';
import { Step as LifiStep, RouteOptions, RoutesRequest, isLifiStep } from '@lifi/types';
import { BridgeCurrency, Chain, Currency, LIFI as LIFIBRIDGE, THORSWAP, Token, TokenAmount } from '@pangolindex/sdk';
import React from 'react';
import { THORSWAP_API, ZERO_ADDRESS } from 'src/constants';
import { BridgePrioritizations, Route } from 'src/state/pbridge/types';
import { calculateTransactionTime } from 'src/utils';
import { ThorswapRoute } from './thorswap/types';

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
    fromAddress: address || undefined,
    toAddress: address || undefined,
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
      bridgeType: LIFIBRIDGE,
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
          bridge: LIFIBRIDGE,
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
                  toAmount: new TokenAmount(subStep?.action?.toToken as Token, subStep?.estimate?.toAmount).toFixed(4),
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

  const response = await fetch(
    `${THORSWAP_API}/aggregator/tokens/quote?sellAsset=${
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
    //&affiliateAddress=${THORSWAP?.affiliate}&affiliateBasisPoints=${THORSWAP?.fee} //TODO:
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
  return [...thorswapRoutes, ...lifiRoutes];
}
