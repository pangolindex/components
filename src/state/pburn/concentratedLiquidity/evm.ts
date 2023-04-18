import { CHAINS, NonfungiblePositionManager, TokenAmount } from '@pangolindex/sdk';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { RemoveConcentratedLiquidityProps } from '../types';

export function useConcentratedRemoveLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();

  return async (data: RemoveConcentratedLiquidityProps) => {
    const { tokenId, liquidities, feeValues, allowedSlippage, deadline, positionSDK, liquidityPercentage } = data;
    const { liquidityValue0, liquidityValue1 } = liquidities;
    const { feeValue0, feeValue1 } = feeValues;
    if (
      !liquidityValue0 ||
      !liquidityValue1 ||
      !tokenId ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage
    ) {
      return;
    }

    try {
      const expectedCurrencyOwed0 = feeValue0 ?? TokenAmount.fromRawAmount(liquidityValue0.token, 0);
      const expectedCurrencyOwed1 = feeValue1 ?? TokenAmount.fromRawAmount(liquidityValue1.token, 0);

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
        to: CHAINS[chainId]?.contracts?.concentratedLiquidity?.nftManager ?? '',
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
          'Remove' +
          ' ' +
          liquidityValue0?.toExact() +
          ' ' +
          liquidityValue0.currency?.symbol +
          'AND' +
          ' ' +
          liquidityValue1?.toExact() +
          ' ' +
          liquidityValue0.currency?.symbol +
          ' ' +
          'Fees' +
          ' ' +
          parameters?.collectOptions?.expectedCurrencyOwed0?.toExact() +
          'AND' +
          ' ' +
          parameters?.collectOptions?.expectedCurrencyOwed1?.toExact(),
      });

      return response;
    } catch (err) {
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    }
  };
}
