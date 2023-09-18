import { parseUnits } from '@ethersproject/units';
import {
  INITIAL_ALLOWED_SLIPPAGE,
  ONE_YOCTO_NEAR,
  useChainId,
  useLibrary,
  usePangolinWeb3,
} from '@honeycomb-finance/shared';
import { useGetNearPoolId, useTransactionAdder } from '@honeycomb-finance/state-hooks';
import {
  NearFunctionCallOptions as FunctionCallOptions,
  NEAR_EXCHANGE_CONTRACT_ADDRESS,
  NearTransaction as Transaction,
  nearFn,
} from '@honeycomb-finance/wallet-connectors';
import { Token, Trade } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { SwapCallbackState } from './constant';

export function useNearSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();

  const addTransaction = useTransactionAdder();

  const poolId = useGetNearPoolId(trade?.inputAmount?.currency as Token, trade?.outputAmount?.currency as Token);

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' };
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<any> {
        const transactions: Transaction[] = [];
        const tokenInActions: FunctionCallOptions[] = [];

        const inputToken = trade.inputAmount?.currency;
        const outPutToken = trade.outputAmount?.currency;

        const inputCurrencyId = inputToken instanceof Token ? inputToken?.address : undefined;
        const outputCurrencyId = outPutToken instanceof Token ? outPutToken?.address : undefined;
        const inputAmount = trade.inputAmount.toExact();

        if (!inputCurrencyId || !outputCurrencyId) {
          throw new Error(`Missing Currency`);
        }

        const tokenRegistered = await nearFn.getStorageBalance(outputCurrencyId).catch(() => {
          throw new Error(`${outPutToken?.symbol} doesn't exist.`);
        });

        if (tokenRegistered === null) {
          transactions.push({
            receiverId: outputCurrencyId,
            functionCalls: [
              nearFn.storageDepositAction({
                accountId: account,
                registrationOnly: true,
                amount: '0.00125',
              }),
            ],
          });
        }

        const swapActions = {
          pool_id: poolId,
          token_in: inputCurrencyId,
          token_out: outputCurrencyId,
          amount_in: parseUnits(inputAmount, inputToken?.decimals).toString(),
          min_amount_out: '0',
        };

        tokenInActions.push({
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: NEAR_EXCHANGE_CONTRACT_ADDRESS[chainId],
            amount: parseUnits(inputAmount, inputToken?.decimals).toString(),
            msg: JSON.stringify({
              force: 0,
              actions: [swapActions],
            }),
          },
          amount: ONE_YOCTO_NEAR,
        });

        transactions.push({
          receiverId: inputCurrencyId,
          functionCalls: tokenInActions,
        });

        return nearFn.executeMultipleTransactions(transactions);
      },
      error: null,
    };
  }, [trade, poolId, library, account, chainId, recipientAddressOrName, addTransaction]);
}
