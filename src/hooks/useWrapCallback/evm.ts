import { CAVAX, Currency, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'src/state/pswap/actions';
import { tryParseAmount, useSwapActionHandlers } from 'src/state/pswap/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useCurrencyBalance } from 'src/state/pwallet/hooks';
import { useChainId, usePangolinWeb3 } from '../index';
import { useWETHContract } from '../useContract';
import { NOT_APPLICABLE, WrapType } from './constant';

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
): { wrapType: WrapType; execute?: () => Promise<void>; inputError?: string; executing?: boolean } {
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
                  addTransaction(txReceipt, { summary: `Wrapped ${inputAmount.toSignificant(6)} AVAX to WAVAX` });
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
                  addTransaction(txReceipt, { summary: `Unwrapped ${inputAmount.toSignificant(6)} WAVAX to AVAX` });
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
