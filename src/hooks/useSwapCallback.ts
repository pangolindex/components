import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { parseUnits } from '@ethersproject/units';
import { JSBI, Percent, Router, SwapParameters, Token, Trade, TradeType } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { NEAR_EXCHANGE_CONTRACT_ADDRESS } from 'src/connectors';
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from 'src/constants';
import { useGetNearPoolId } from 'src/data/Reserves';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { calculateGasMargin, getRouterContract, isAddress, shortenAddress } from 'src/utils';
import isZero from 'src/utils/isZero';
import { FunctionCallOptions, Transaction, nearFn } from 'src/utils/near';
import useENS from './useENS';
import { Version } from './useToggledVersion';
import useTransactionDeadline from './useTransactionDeadline';
import { useChainId, useLibrary, usePangolinWeb3 } from './index';

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

interface SuccessfulCall {
  call: SwapCall;
  gasEstimate: BigNumber;
}

interface FailedCall {
  call: SwapCall;
  error: Error;
}

type EstimatedSwapCall = SuccessfulCall | FailedCall;

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId } = usePangolinWeb3();
  const { library } = useLibrary();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;
  let deadline = useTransactionDeadline();

  const currentTime = BigNumber.from(new Date().getTime());
  if (deadline && deadline < currentTime.add(10)) {
    deadline = currentTime.add(10);
  }

  return useMemo(() => {
    const tradeVersion = Version.v2;
    if (!trade || !recipient || !library || !account || !tradeVersion || !chainId || !deadline) return [];

    const contract: Contract | null = getRouterContract(chainId, library, account);
    if (!contract) {
      return [];
    }

    const swapMethods = [] as Array<SwapParameters>;

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber(),
      }),
    );

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber(),
        }),
      );
    }

    return swapMethods.map((parameters) => ({ parameters, contract }));
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade]);
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId } = usePangolinWeb3();
  const { library } = useLibrary();

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName);

  const addTransaction = useTransactionAdder();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' };
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' };
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null };
      }
    }

    const tradeVersion = Version.v2;

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call;
            const options = !value || isZero(value) ? {} : { value };

            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                };
              })
              .catch((gasError) => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call);

                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result);
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') };
                  })
                  .catch((callError) => {
                    console.debug('Call threw error', call, callError);
                    let errorMessage: string;
                    switch (callError.reason) {
                      case 'PangolinRouter: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'PangolinRouter: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.';
                        break;
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`;
                    }
                    return { call, error: new Error(errorMessage) };
                  });
              });
          }),
        );

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        );

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call);
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error;
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error');
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation;

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol;
            const outputSymbol = trade.outputAmount.currency.symbol;
            const inputAmount = trade.inputAmount.toSignificant(3);
            const outputAmount = trade.outputAmount.toSignificant(3);

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName, chainId)
                      : recipientAddressOrName
                  }`;

            const withVersion =
              tradeVersion === Version.v2
                ? withRecipient
                : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`;

            addTransaction(response, {
              summary: withVersion,
            });

            return response.hash;
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.');
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value);
              throw new Error(`Swap failed: ${error.message}`);
            }
          });
      },
      error: null,
    };
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction]);
}

export function useNearSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
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
        const tokenOutActions: FunctionCallOptions[] = [];
        const inputToken = trade.inputAmount?.currency;
        const outPutToken = trade.outputAmount?.currency;

        const inputCurrencyId = inputToken instanceof Token ? inputToken?.address : undefined;
        const outputCurrencyId = outPutToken instanceof Token ? outPutToken?.address : undefined;
        const inputAmount = trade.inputAmount.toExact();

        if (!inputCurrencyId || !outputCurrencyId) {
          throw new Error(`Missing Currency`);
        }

        const tokenRegistered = await nearFn.getStorageBalance(outputCurrencyId, account).catch(() => {
          throw new Error(`${trade.outputAmount.currency?.symbol} doesn't exist.`);
        });

        if (tokenRegistered === null) {
          tokenOutActions.push({
            methodName: 'storage_deposit',
            args: {
              registration_only: true,
              account_id: account,
            },
            gas: '30000000000000',
            amount: '1',
          });

          transactions.push({
            receiverId: outputCurrencyId,
            functionCalls: tokenOutActions,
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
          gas: '180000000000000',
          amount: '1',
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
