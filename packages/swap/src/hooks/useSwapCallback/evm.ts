import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  BIPS_BASE,
  INITIAL_ALLOWED_SLIPPAGE,
  ZERO_ADDRESS,
  calculateGasMargin,
  getRouterContract,
  getRouterContractDaaS,
  isAddress,
  isZero,
  shortenAddress,
  useChainId,
  useENS,
  useLibrary,
  usePangolinWeb3,
} from '@honeycomb-finance/shared';
import { useTransactionAdder, useTransactionDeadline } from '@honeycomb-finance/state-hooks';
import {
  CHAINS,
  ElixirTrade,
  JSBI,
  Percent,
  Router,
  SwapParameters,
  SwapRouter,
  Trade,
  TradeType,
} from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useDaasFeeTo } from 'src/state/hooks/common';
import { Version } from '../useToggledVersion';
import { SwapCallbackState } from './constant';

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
  const [partnerDaaS] = useDaasFeeTo();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;
  let deadline = useTransactionDeadline();

  const currentTime = BigNumber.from(new Date().getTime());
  if (deadline && deadline < currentTime.add(10)) {
    deadline = currentTime.add(10);
  }

  const contract: Contract | null = useMemo(() => {
    if (!chainId || !library || !account || !partnerDaaS) return null;
    return partnerDaaS === ZERO_ADDRESS
      ? getRouterContract(chainId, library, account)
      : getRouterContractDaaS(chainId, library, account);
  }, [chainId, library, account, partnerDaaS]);

  return useMemo(() => {
    if (!trade || !contract || !recipient || !deadline) {
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
  }, [trade, contract, allowedSlippage, recipient, deadline]);
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | ElixirTrade | undefined, // trade to execute, required
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account } = usePangolinWeb3();
  const { library } = useLibrary();
  const chainId = useChainId();
  const deadline = useTransactionDeadline();

  // this is only needed for v2 swao routing
  // for elixir swap routing there is separate logic below
  const swapCalls = useSwapCallArguments(
    trade instanceof Trade ? trade : undefined,
    allowedSlippage,
    recipientAddressOrName,
  );
  const addTransaction = useTransactionAdder();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;

  return useMemo(() => {
    if (!trade || !account || !chainId || !deadline) {
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
        // if swap is using elixir pools then use different way to sign transaction
        if (trade instanceof ElixirTrade) {
          const { calldata, value } = SwapRouter.swapCallParameters(trade, {
            deadline: deadline?.toString(),
            recipient: account,
            slippageTolerance: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          });

          const txn: { to: string; data: string; value: string } = {
            to: CHAINS[chainId]?.contracts?.elixir?.swapRouter ?? '',
            data: calldata,
            value,
          };

          try {
            const estimatedGasLimit = await library.getSigner().estimateGas(txn);

            const swapTx = {
              ...txn,
              gasLimit: calculateGasMargin(estimatedGasLimit),
            };

            const response = await library.getSigner().sendTransaction(swapTx);

            const inputSymbol = trade.inputAmount.currency.symbol;
            const outputSymbol = trade.outputAmount.currency.symbol;
            const inputAmount = trade.inputAmount.toSignificant(3);
            const outputAmount = trade.outputAmount.toSignificant(3);
            const swapTxMsg = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;

            addTransaction(response, {
              summary: swapTxMsg,
            });
            console.log(response);

            return response.hash;
          } catch (error: any) {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.');
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, calldata, value);
              throw new Error(`Swap failed: ${error.message}`);
            }
          }
        }

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
  }, [trade, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction]);
}
