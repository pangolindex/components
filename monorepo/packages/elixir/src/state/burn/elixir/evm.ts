import { CHAINS, NonfungiblePositionManager, Token, TokenAmount } from '@pangolindex/sdk';
import { useChainId, useLibrary, usePangolinWeb3, wrappedCurrency } from '@pangolindex/shared';
import { useTransactionAdder } from '@pangolindex/state-hooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { RemoveElixirLiquidityProps } from '../types';

export function useElixirRemoveLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();

  return async (data: RemoveElixirLiquidityProps) => {
    const { tokenId, liquidities, feeValues, allowedSlippage, deadline, positionSDK, liquidityPercentage } = data;
    const { liquidityValue0, liquidityValue1 } = liquidities;
    const { feeValue0, feeValue1 } = feeValues;
    if (
      !liquidityValue0 ||
      !liquidityValue1 ||
      !tokenId ||
      !library ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage
    ) {
      return;
    }

    try {
      const expectedCurrencyOwed0 = feeValue0
        ? TokenAmount.fromRawAmount(wrappedCurrency(feeValue0?.token, chainId) as Token, feeValue0.raw)
        : TokenAmount.fromRawAmount(liquidityValue0.token, 0);
      const expectedCurrencyOwed1 = feeValue1
        ? TokenAmount.fromRawAmount(wrappedCurrency(feeValue1?.token, chainId) as Token, feeValue1.raw)
        : TokenAmount.fromRawAmount(liquidityValue1.token, 0);

      const parameters = {
        tokenId: tokenId.toString(),
        liquidityPercentage,
        slippageTolerance: allowedSlippage,
        deadline: deadline.toString(),
        collectOptions: {
          expectedCurrencyOwed0,
          expectedCurrencyOwed1,
          recipient: account,
          chainId,
        },
      };

      // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
      // vast majority of cases
      const { calldata, value } = NonfungiblePositionManager.removeCallParameters(positionSDK, parameters);

      const txn: { to: string; data: string; value: string } = {
        to: CHAINS[chainId]?.contracts?.elixir?.nftManager ?? '',
        data: calldata,
        value,
      };

      const estimatedGasLimit = await library.getSigner().estimateGas(txn);

      const newTxn = {
        ...txn,
        gasLimit: calculateGasMargin(estimatedGasLimit),
      };

      const response = await library.getSigner().sendTransaction(newTxn);
      await waitForTransaction(response, 5);

      addTransaction(response, {
        summary:
          'Removed' + ' ' + liquidityValue0 &&
          parseFloat(liquidityValue0.toSignificant(6)) / 100 +
            ' ' +
            liquidityValue0.currency?.symbol +
            ' ' +
            'AND' +
            ' ' +
            liquidityValue1 &&
          parseFloat(liquidityValue1.toSignificant(6)) / 100 +
            ' ' +
            liquidityValue1.currency?.symbol +
            ' ' +
            'Fees' +
            ' ' +
            parameters?.collectOptions?.expectedCurrencyOwed0?.toExact() +
            ' ' +
            'AND' +
            ' ' +
            parameters?.collectOptions?.expectedCurrencyOwed1?.toExact(),
      });

      return response;
    } catch (err) {
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        throw new Error('User Rejected Transaction');
      }
      throw _err;
    }
  };
}
