import { BTC_MAINNET, BridgeCurrency, Chain, THORSWAP } from '@pangolindex/sdk';
import { Network } from '@xchainjs/xchain-client';
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  TxDetails,
} from '@xchainjs/xchain-thorchain-query';
import { AssetRuneNative, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util';
import { BigNumber } from 'bignumber.js';
import React from 'react';
// import { BRIDGE_THORSWAP } from 'src/constants';
import { BridgePrioritizations, Route } from 'src/state/pbridge/types';
import { calculateTransactionTime } from 'src/utils';

export async function useThorChainRoutes(
  amount: string,
  slipLimit: string,
  fromChain?: Chain,
  toChain?: Chain,
  address?: string | null,
  fromCurrency?: BridgeCurrency,
  toCurrency?: BridgeCurrency,
  recipient?: string | null | undefined,
): Promise<Route[]> {
  //TODO: Whole function needs to be refactored
  // const thorswapPoolResponse = await fetch(
  //   `${BRIDGE_THORSWAP}/universal/exchangeAmountDetails?from=${fromChain?.symbol}.${fromCurrency?.symbol}&to=${toChain?.symbol}.${toCurrency?.symbol}&amount=${amount}`,
  // );
  // console.log('thorswapPoolResponse: ', thorswapPoolResponse);
  const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet));
  const thorchainQuery = new ThorchainQuery(thorchainCache);
  const fromAsset = assetFromString(`${fromChain?.symbol}.${fromCurrency?.symbol}`);
  const toAsset = assetFromString(`${toChain?.symbol}.${toCurrency?.symbol}`);
  const swapParams: EstimateSwapParams = {
    input: new CryptoAmount(assetToBase(assetAmount(amount)), fromAsset || AssetRuneNative),
    destinationAsset: toAsset || AssetRuneNative,
    destinationAddress: address || '',
    slipLimit: new BigNumber(slipLimit),
  };
  const estimate: TxDetails = await thorchainQuery.estimateSwap(swapParams);
  const assetUSDC = assetFromString(`${toChain?.symbol}.USDC`);
  const amountUsdcEqual = await thorchainQuery.convert(estimate?.txEstimate.netOutput, assetUSDC || AssetRuneNative);
  const totalFee: CryptoAmount = estimate?.txEstimate.totalFees.swapFee.plus(
    estimate?.txEstimate.totalFees.outboundFee.plus(
      estimate?.txEstimate.totalFees.inboundFee.plus(estimate?.txEstimate.totalFees.affiliateFee),
    ),
  );
  const totalFeeUsdcEqual = await thorchainQuery.convert(totalFee, assetUSDC || AssetRuneNative);

  const routes: Route[] = [
    {
      memo: estimate?.memo,
      waitingTime: calculateTransactionTime(estimate?.txEstimate.waitTimeSeconds),
      fromChainId: fromChain?.id || '',
      fromAmount: amount,
      fromToken: fromCurrency?.symbol || '',
      toToken: toCurrency?.symbol || '',
      fromAddress: address || '',
      toChainId: toChain?.id || '',
      toAmount: estimate?.txEstimate.netOutput.assetAmountFixedString(),
      toAmountUSD: `${amountUsdcEqual.assetAmountFixedString()} USD`,
      toAddress: (toChain?.id === BTC_MAINNET.id && recipient) || address || '',
      gasCostUSD: `${totalFeeUsdcEqual.assetAmountFixedString()} USD`,
      steps: [
        {
          bridge: THORSWAP,
          type: 'bridge',
          includedSteps: [
            {
              type: 'swap',
              action: {
                fromChainId: 1,
                fromToken: fromCurrency?.symbol || '',
                toToken: toCurrency?.symbol || '',
                fromAmount: amount,
                toChainId: 2,
                slippage: parseFloat(slipLimit),
              },
              estimate: {
                fromAmount: amount,
                toAmount: `${estimate?.txEstimate.netOutput.assetAmountFixedString()} ${
                  estimate?.txEstimate.netOutput.asset.symbol
                }`,
                approvalAddress: '0x3268u268276y876adfh',
                executionDuration: 39,
              },
            },
          ],
        },
      ],
      transactionType: BridgePrioritizations.recommended,
      selected: true,
    },
    {
      //TODO: Remove this route
      memo: estimate?.memo,
      waitingTime: calculateTransactionTime(estimate?.txEstimate.waitTimeSeconds),
      fromChainId: fromChain?.id || '',
      fromAmount: amount,
      fromToken: fromCurrency?.symbol || '',
      toToken: toCurrency?.symbol || '',
      fromAddress: address || '',
      toChainId: toChain?.id || '',
      toAmount: `100000`,
      toAmountUSD: `${amountUsdcEqual.assetAmountFixedString()} USD`,
      toAddress: address || '',
      gasCostUSD: `${totalFeeUsdcEqual.assetAmountFixedString()} USD`,
      steps: [
        {
          bridge: THORSWAP,
          type: 'bridge',
          includedSteps: [
            {
              type: 'swap',
              action: {
                fromChainId: 1,
                fromToken: fromCurrency?.symbol || '',
                toToken: toCurrency?.symbol || '',
                fromAmount: amount,
                toChainId: 2,
                slippage: parseFloat(slipLimit),
              },
              estimate: {
                fromAmount: amount,
                toAmount: `${estimate?.txEstimate.netOutput.assetAmountFixedString()} ${
                  estimate?.txEstimate.netOutput.asset.symbol
                }`,
                approvalAddress: '0x3268u268276y876adfh',
                executionDuration: 39,
              },
            },
          ],
        },
      ],
      transactionType: BridgePrioritizations.fast,
      selected: false,
    },
  ];
  return routes;
}
