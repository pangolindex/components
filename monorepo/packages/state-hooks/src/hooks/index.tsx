import { useApproveCallbackFromTradeHook, useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { useApproveCallback } from 'src/hooks/useApproveCallback/evm';
import { usePairsHook } from 'src/hooks/usePair';
import { useGetNearPoolId } from 'src/hooks/usePair/near';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice/evm';
import { useAllTokens } from './useAllTokens';

// hooks
export {
  useUSDCPrice,
  useUSDCPriceHook,
  useApproveCallbackHook,
  useApproveCallbackFromTradeHook,
  useApproveCallback,
  useTransactionDeadline,
  useParsedQueryString,
  usePairsHook,
  useGetNearPoolId,
  useAllTokens,
};

export { ApprovalState };
