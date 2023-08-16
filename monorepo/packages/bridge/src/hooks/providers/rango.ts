import { parseUnits } from '@ethersproject/units';
import { Currency, RANGO, Token, TokenAmount } from '@pangolindex/sdk';
import {
  BlockchainMeta,
  EvmBlockchainMeta,
  QuoteRequest,
  QuoteResponse,
  RangoClient,
  RoutingResultType,
  SwapRequest,
  SwapResponse,
  TransactionType,
} from 'rango-sdk-basic';
import { NATIVE, RANGO_API_KEY, ZERO_ADDRESS, calculateTransactionTime } from '@pangolindex/shared';
import { BridgePrioritizations, GetRoutes, GetRoutesProps, Route, Step } from '../types';

export const getRangoRoutes: GetRoutes = async ({
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
  if (!fromCurrency?.symbol || !toCurrency?.symbol) {
    return [];
  }
  const rango = new RangoClient(RANGO_API_KEY);
  const chains = await rango.chains();
  const isEvmBlockchain = (chain: BlockchainMeta): chain is EvmBlockchainMeta => chain.type === TransactionType.EVM;
  const evmChainIdToName = Object.assign(
    {},
    ...chains.filter(isEvmBlockchain).map((chain) => ({
      [chain.chainId.toString()]: chain.name,
    })),
  );

  const fromCurrencyAddress = [ZERO_ADDRESS, NATIVE].includes(fromCurrency.address) ? null : fromCurrency.address;
  const toCurrencyAddress = [ZERO_ADDRESS, NATIVE].includes(toCurrency.address) ? null : toCurrency.address;

  let request: QuoteRequest | SwapRequest = {
    from: {
      blockchain: evmChainIdToName[fromCurrency.chainId.toString()],
      symbol: fromCurrency?.symbol,
      address: fromCurrencyAddress,
    },
    to: {
      blockchain: evmChainIdToName[toCurrency.chainId.toString()],
      symbol: toCurrency?.symbol,
      address: toCurrencyAddress,
    },
    amount: parsedAmount,
  };
  let rangoRouteRes: QuoteResponse | SwapResponse;

  if (!fromAddress) {
    rangoRouteRes = await rango.quote(request);
  } else {
    request = {
      ...request,
      fromAddress: fromAddress,
      toAddress: recipient || fromAddress,
      slippage: slipLimit,
      disableEstimate: false,
      referrerAddress: null,
      referrerFee: null,
    };
    rangoRouteRes = await rango.swap(request);
  }

  // no routes found
  if (rangoRouteRes?.resultType !== RoutingResultType.OK || !rangoRouteRes?.route) return [];

  // routes founds but failed to create tx or pass validation checks
  // currently, other providers show users route if user doesn't have enough balance, and fails in executing route
  if (
    rangoRouteRes?.resultType === RoutingResultType.OK &&
    !!rangoRouteRes?.error &&
    !rangoRouteRes?.error?.includes('balance')
  )
    return [];

  const rangoRoute: Route | undefined = rangoRouteRes?.route
    ? {
        nativeRoute: rangoRouteRes,
        bridgeType: RANGO,
        waitingTime: calculateTransactionTime(rangoRouteRes?.route?.estimatedTimeInSeconds),
        toToken: toCurrency?.symbol,
        toAmount: new TokenAmount(toCurrency as Currency as Token, rangoRouteRes?.route?.outputAmount).toFixed(4),
        toAmountNet: new TokenAmount(toCurrency as Currency as Token, rangoRouteRes?.route?.outputAmountMin).toFixed(4),
        toAmountUSD: `${rangoRouteRes?.route?.outputAmountUsd?.toFixed(4)} USD`,
        gasCostUSD: rangoRouteRes?.route?.feeUsd?.toFixed(2),
        steps: [
          {
            bridge: RANGO,
            type: 'rango',
            includedSteps: rangoRouteRes?.route?.path
              ? rangoRouteRes?.route?.path.map(
                  (step) =>
                    ({
                      type: step?.swapperType === 'DEX' ? 'swap' : 'cross',
                      integrator: step?.swapper?.title,
                      action: {
                        toToken: step?.to?.symbol,
                      },
                      estimate: {
                        toAmount: new TokenAmount(step?.to as unknown as Token, step?.expectedOutput).toFixed(4),
                      },
                    } as Step),
                )
              : [
                  {
                    type: fromChain?.chain_id === toChain?.chain_id ? 'swap' : 'cross',
                    integrator: rangoRouteRes?.route?.swapper?.title,
                    action: {
                      toToken: rangoRouteRes?.route?.to?.symbol,
                    },
                    estimate: {
                      toAmount: new TokenAmount(
                        rangoRouteRes?.route?.to as unknown as Token,
                        rangoRouteRes?.route?.outputAmount,
                      ).toFixed(4),
                    },
                  } as Step,
                ],
            action: {
              toToken: toCurrency?.symbol,
            },
            estimate: {
              toAmount: new TokenAmount(toCurrency as Currency as Token, rangoRouteRes?.route?.outputAmount).toFixed(4),
            },
          },
        ],
        transactionType: BridgePrioritizations.RECOMMENDED,
        selected: false,
      }
    : undefined;

  return !!rangoRoute ? [rangoRoute] : [];
};
