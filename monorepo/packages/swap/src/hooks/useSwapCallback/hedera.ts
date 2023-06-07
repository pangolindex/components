import { BigNumber } from '@ethersproject/bignumber';
import { CAVAX, JSBI, Percent, Router, Trade, TradeType } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { INITIAL_ALLOWED_SLIPPAGE } from '@pangolindex/constants';
import { BIPS_BASE } from 'src/constants';
import { useTransactionAdder } from '@pangolindex/state';
import { hederaFn } from 'src/utils/hedera';
import { useChainId, usePangolinWeb3, useTransactionDeadline } from '@pangolindex/hooks';
import { Version } from '../useToggledVersion';
import { SwapCallbackState } from './constant';

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useHederaSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  recipientAddress: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  let deadline = useTransactionDeadline();

  const currentTime = BigNumber.from(new Date().getTime());
  if (deadline && deadline < currentTime.add(10)) {
    deadline = currentTime.add(10);
  }

  const addTransaction = useTransactionAdder();

  let recipient: string | null | undefined = '';

  if (recipientAddress === null || !recipientAddress) {
    recipient = account;
  } else if (hederaFn.isHederaIdValid(recipientAddress)) {
    recipient = hederaFn.idToAddress(recipientAddress);
  }

  return useMemo(() => {
    if (!trade || !account || !chainId || !deadline) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' };
    }
    if (!recipient) {
      if (recipientAddress !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' };
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null };
      }
    }

    const calls = Router.swapCallParameters(trade, {
      feeOnTransfer: trade.tradeType === TradeType.EXACT_INPUT ? true : false,
      allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
      recipient,
      deadline: deadline?.toNumber(),
    });

    const tradeVersion = Version.v2;

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        try {
          if (!recipient) return '';

          const inputCurrency = trade.inputAmount.currency;

          const amountIn = trade.maximumAmountIn(new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE));
          const amountOut = trade.minimumAmountOut(new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE));

          const args = {
            methodName: calls?.methodName,

            HBARAmount: inputCurrency === CAVAX[chainId] ? amountIn?.toExact() : undefined,
            tokenInAmount: amountIn?.raw?.toString(),
            tokenOutAmount: amountOut?.raw?.toString(),
            path: trade.route.path.map((token) => token.address), // token address
            recipient,
            account,
            chainId,
            deadline: deadline ? deadline?.toNumber() : 0,
            exactAmountIn: trade.tradeType === TradeType.EXACT_INPUT,
          };
          const response = await hederaFn.swap(args);

          if (response) {
            const inputSymbol = trade.inputAmount.currency.symbol;
            const outputSymbol = trade.outputAmount.currency.symbol;
            const inputAmount = trade.inputAmount.toSignificant(3);
            const outputAmount = trade.outputAmount.toSignificant(3);

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;

            const withRecipient = recipient === account ? base : `${base} to ${recipientAddress}`;

            const withVersion =
              tradeVersion === Version.v2
                ? withRecipient
                : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`;

            addTransaction(response, {
              summary: withVersion,
            });

            return response.hash;
          }

          return '';
        } catch (error: any) {
          // if the user rejected the tx, pass this along
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Swap failed`, error);
            throw new Error(`Swap failed: ${error.message}`);
          }
        }
      },

      error: null,
    };
  }, [trade, account, chainId, recipient, recipientAddress, addTransaction, deadline]);
}
