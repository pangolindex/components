import { CAVAX, Currency, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { parseUnits } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'src/state/pswap/actions';
import { tryParseAmount, useSwapActionHandlers } from 'src/state/pswap/hooks';
import { hederaFn } from 'src/utils/hedera';
import { Transaction, nearFn } from 'src/utils/near';
import { useTransactionAdder } from '../state/ptransactions/hooks';
import { useCurrencyBalance } from '../state/pwallet/hooks';
import { useWETHContract } from './useContract';
import { useChainId, usePangolinWeb3 } from './index';

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE, executing: false };
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
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string; executing?: boolean } {
  const { account } = usePangolinWeb3();

  const chainId = useChainId();

  const { t } = useTranslation();
  const [executing, setExecuting] = useState(false);
  const { onUserInput } = useSwapActionHandlers(chainId);

  const wethContract = useWETHContract();
  const balance = useCurrencyBalance(chainId, account ?? undefined, inputCurrency);
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue]);
  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

    let inputError = !typedValue ? t('swapHooks.enterAmount') : undefined;

    if (inputCurrency === CAVAX[chainId] && currencyEquals(WAVAX[chainId], outputCurrency)) {
      inputError =
        inputError ??
        (sufficientBalance ? undefined : t('swapHooks.insufficientBalance', { symbol: CAVAX[chainId].symbol }));

      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setExecuting(true);
                  const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.raw.toString(16)}` });
                  onUserInput(Field.INPUT, '');
                  addTransaction(txReceipt, { summary: `Wrap ${inputAmount.toSignificant(6)} AVAX to WAVAX` });
                } catch (error) {
                  console.error('Could not deposit', error);
                } finally {
                  setExecuting(false);
                }
              }
            : undefined,
        inputError: inputError,
        executing: executing,
      };
    } else if (currencyEquals(WAVAX[chainId], inputCurrency) && outputCurrency === CAVAX[chainId]) {
      inputError =
        inputError ??
        (sufficientBalance ? undefined : t('swapHooks.insufficientBalance', { symbol: WAVAX[chainId].symbol }));

      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setExecuting(true);
                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`);
                  onUserInput(Field.INPUT, '');
                  addTransaction(txReceipt, { summary: `Unwrap ${inputAmount.toSignificant(6)} WAVAX to AVAX` });
                } catch (error) {
                  console.error('Could not withdraw', error);
                } finally {
                  setExecuting(false);
                }
              }
            : undefined,
        inputError: inputError,
        executing: executing,
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [
    wethContract,
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    addTransaction,
    onUserInput,
    executing,
    setExecuting,
  ]);
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
): { wrapType: WrapType; execute?: () => Promise<void>; inputError?: string; executing?: boolean } {
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

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export function useWrapHbarCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
): { wrapType: WrapType; execute?: () => Promise<void>; inputError?: string; executing?: boolean } {
  const { account } = usePangolinWeb3();
  const { t } = useTranslation();
  const chainId = useChainId();
  const [executing, setExecuting] = useState(false);
  const { onUserInput } = useSwapActionHandlers(chainId);
  const balance = useCurrencyBalance(chainId, account ?? undefined, inputCurrency);

  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(
    () => tryParseAmount(typedValue, inputCurrency, chainId),
    [inputCurrency, typedValue, chainId],
  );

  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!chainId || !inputCurrency || !outputCurrency || !account) return NOT_APPLICABLE;

    let inputError = !typedValue ? t('swapHooks.enterAmount') : undefined;

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

    if (inputCurrency === CAVAX[chainId] && currencyEquals(WAVAX[chainId], outputCurrency)) {
      inputError =
        inputError ??
        (sufficientBalance ? undefined : t('swapHooks.insufficientBalance', { symbol: CAVAX[chainId].symbol }));

      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setExecuting(true);
                  const txReceipt = await hederaFn.depositAction(inputAmount, account, chainId);

                  if (txReceipt) {
                    onUserInput(Field.INPUT, '');
                    addTransaction(txReceipt, { summary: `Wrap ${inputAmount.toSignificant(6)} HBAR to WHBAR` });
                  }
                } catch (error) {
                  console.error('Could not deposit', error);
                } finally {
                  setExecuting(false);
                }
              }
            : undefined,
        inputError: inputError,
        executing: executing,
      };
    } else if (currencyEquals(WAVAX[chainId], inputCurrency) && outputCurrency === CAVAX[chainId]) {
      inputError =
        inputError ??
        (sufficientBalance ? undefined : t('swapHooks.insufficientBalance', { symbol: WAVAX[chainId].symbol }));
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setExecuting(true);
                  const txReceipt = await hederaFn.withdrawAction(inputAmount, account, chainId);

                  if (txReceipt) {
                    onUserInput(Field.INPUT, '');
                    addTransaction(txReceipt, {
                      summary: `Unwrap ${inputAmount.toSignificant(6)} WHBAR to HBAR`,
                    });
                  }
                } catch (error) {
                  console.error('Could not withdraw', error);
                } finally {
                  setExecuting(false);
                }
              }
            : undefined,
        inputError: inputError,
        executing: executing,
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    account,
    addTransaction,
    onUserInput,
    executing,
    setExecuting,
  ]);
}
