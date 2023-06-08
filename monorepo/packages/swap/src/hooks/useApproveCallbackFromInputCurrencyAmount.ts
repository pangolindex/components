import { useGelatoLimitOrdersLib } from '@gelatonetwork/limit-orders-react';
import { useApproveCallback, useChainId } from '@pangolindex/hooks';
import { TokenAmount } from '@pangolindex/sdk';
// TODO: Transfer From useApproveCallBack
// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromInputCurrencyAmount(currencyAmountIn: any | undefined) {
  const chainId = useChainId();
  const gelatoLibrary = useGelatoLimitOrdersLib();

  const newCurrencyAmountIn = currencyAmountIn
    ? new TokenAmount(currencyAmountIn?.currency, currencyAmountIn?.numerator)
    : undefined;

  return useApproveCallback(chainId, newCurrencyAmountIn, gelatoLibrary?.erc20OrderRouter.address ?? undefined);
}
