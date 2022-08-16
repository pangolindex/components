import { CAVAX, Currency, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { parseUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { Transaction, nearFn } from 'src/utils/near';
import { tryParseAmount } from '../state/pswap/hooks';
import { useTransactionAdder } from '../state/ptransactions/hooks';
import { useCurrencyBalance } from '../state/pwallet/hooks';
import { useWETHContract } from './useContract';
import { useChainId, usePangolinWeb3 } from './index';

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE };
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { account } = usePangolinWeb3();

  const chainId = useChainId();

  const wethContract = useWETHContract();
  const balance = useCurrencyBalance(chainId, account ?? undefined, inputCurrency);
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue]);
  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

    if (inputCurrency === CAVAX[chainId] && currencyEquals(WAVAX[chainId], outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.raw.toString(16)}` });
                  addTransaction(txReceipt, { summary: `Wrap ${inputAmount.toSignificant(6)} AVAX to WAVAX` });
                } catch (error) {
                  console.error('Could not deposit', error);
                }
              }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient AVAX balance',
      };
    } else if (currencyEquals(WAVAX[chainId], inputCurrency) && outputCurrency === CAVAX[chainId]) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`);
                  addTransaction(txReceipt, { summary: `Unwrap ${inputAmount.toSignificant(6)} WAVAX to AVAX` });
                } catch (error) {
                  console.error('Could not withdraw', error);
                }
              }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient WAVAX balance',
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction]);
}

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export function useWrapNearCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
): { wrapType: WrapType; execute?: () => Promise<void>; inputError?: string } {
  const { account } = usePangolinWeb3();

  const chainId = useChainId();

  const balance = useCurrencyBalance(chainId, account ?? undefined, inputCurrency);
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(
    () => tryParseAmount(typedValue, inputCurrency, chainId),
    [inputCurrency, typedValue, chainId],
  );
  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

    const unWrapFunction = async () => {
      if (sufficientBalance && inputAmount) {
        try {
          //addTransaction({} as any, { summary: `Unwrap ${inputAmount.toSignificant(6)} WNear to Near` });
          const transactions: Transaction[] = [
            {
              receiverId: WAVAX[chainId].address,
              functionCalls: [
                nearFn.nearDepositAction(parseUnits(inputAmount.toFixed(), WAVAX[chainId]?.decimals).toString()),
              ],
            },
          ];
          nearFn.executeMultipleTransactions(transactions);
        } catch (error) {
          console.error('Could not withdraw', error);
        }
      }
    };

    const wrapFunction = async () => {
      if (sufficientBalance && inputAmount) {
        try {
          //addTransaction({} as any, { summary: `Wrap ${inputAmount.toSignificant(6)} NEAR to wNear` });
          const transaction: Transaction[] = [
            {
              receiverId: WAVAX[chainId].address,
              functionCalls: [nearFn.nearWithdrawAction(inputAmount.toSignificant(6))],
            },
          ];
          nearFn.executeMultipleTransactions(transaction);
        } catch (error) {
          console.error('Could not withdraw', error);
        }
      }
    };

    if (inputCurrency === CAVAX[chainId] && currencyEquals(WAVAX[chainId], outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        execute: wrapFunction,
        inputError: sufficientBalance ? undefined : 'Insufficient NEAR balance',
      };
    } else if (currencyEquals(WAVAX[chainId], inputCurrency) && outputCurrency === CAVAX[chainId]) {
      return {
        wrapType: WrapType.UNWRAP,
        execute: unWrapFunction,
        inputError: sufficientBalance ? undefined : 'Insufficient wNear balance',
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction]);
}
