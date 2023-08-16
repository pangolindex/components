import { Call, GetRoute, RouteResponse, Route as SquidRoute, RouteData as SquidRouteData } from '@0xsquid/sdk';
import { parseUnits } from '@ethersproject/units';
import { Currency, SQUID, Token, TokenAmount } from '@pangolindex/sdk';
import axios from 'axios';
import { SQUID_API, calculateTransactionTime } from '@pangolindex/shared';
import { BridgePrioritizations, GetRoutes, GetRoutesProps, Route, Step } from '../types';

export const getSquidRoutes: GetRoutes = async ({
  amount,
  slipLimit,
  fromChain,
  toChain,
  fromAddress,
  fromCurrency,
  toCurrency,
  recipient,
}: GetRoutesProps) => {
  const parsedAmount = parseUnits(amount, fromCurrency?.decimals).toString();

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
        toAmount: new TokenAmount(toCurrency as Currency as Token, squidRouteRes.route.estimate.toAmount).toFixed(4),
        toAmountNet: new TokenAmount(toCurrency as Currency as Token, squidRouteRes.route.estimate.toAmountMin).toFixed(
          4,
        ),
        toAmountUSD: `${squidRouteRes.route.estimate?.toAmountUSD} USD`,
        gasCostUSD: (
          squidRouteRes.route.estimate.gasCosts.reduce((prevValue, currentValue) => {
            return prevValue + parseFloat(currentValue.amountUSD);
          }, 0) +
          squidRouteRes.route.estimate.feeCosts.reduce((prevValue, currentValue) => {
            return prevValue + parseFloat(currentValue.amountUSD);
          }, 0)
        ).toFixed(2),
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
              toAmount: new TokenAmount(toCurrency as Currency as Token, squidRouteRes.route.estimate.toAmount).toFixed(
                4,
              ),
            },
          },
        ],
        transactionType: BridgePrioritizations.RECOMMENDED,
        selected: false,
      }
    : undefined;
  return !!squidRoute ? [squidRoute] : [];
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
