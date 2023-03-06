import { CAVAX, Currency, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'src/state/pswap/actions';
import { tryParseAmount, useSwapActionHandlers } from 'src/state/pswap/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useCurrencyBalance } from 'src/state/pwallet/hooks';
import { hederaFn } from 'src/utils/hedera';
import { useChainId, usePangolinWeb3 } from '../index';
import { NOT_APPLICABLE, WrapType } from './constant';

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
