import { useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { useAllTokens } from 'src/hooks/useAllTokens';
import { useApproveCallbackFromTradeHook, useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { useApproveCallback } from 'src/hooks/useApproveCallback/evm';
import { useHederaApproveCallback } from 'src/hooks/useApproveCallback/hedera';
import { useCurrency } from 'src/hooks/useCurrency';
import { useFetchListCallback } from 'src/hooks/useFetchListCallback';
import { useGetNearPoolId } from 'src/hooks/usePair/near';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice/evm';

export * from 'src/hooks/usePair';
export * from 'src/hooks/tokens';

// hooks
export {
  useUSDCPrice,
  useUSDCPriceHook,
  useApproveCallbackHook,
  useApproveCallbackFromTradeHook,
  useApproveCallback,
  useTransactionDeadline,
  useParsedQueryString,
  useGetNearPoolId,
  useAllTokens,
  useFetchListCallback,
  useHederaTokenAssociated,
  useHederaApproveCallback,
  useCurrency,
};

export { ApprovalState };
