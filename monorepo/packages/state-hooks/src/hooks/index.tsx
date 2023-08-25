import { useTokenHook, useTokensHook } from 'src/hooks/tokens';
import { useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { useAllTokens } from 'src/hooks/useAllTokens';
import { useApproveCallbackFromTradeHook, useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { useApproveCallback } from 'src/hooks/useApproveCallback/evm';
import { useHederaApproveCallback } from 'src/hooks/useApproveCallback/hedera';
import { useCurrency } from 'src/hooks/useCurrency';
import { useFetchListCallback } from 'src/hooks/useFetchListCallback';
import { usePairsHook } from 'src/hooks/usePair';
import { useGetNearPoolId } from 'src/hooks/usePair/near';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice/evm';
import { useToken } from './tokens/evm';
import { usePair } from './usePair/evm';
import { useTotalSupplyHook } from './useTotalSupply';

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
  useTotalSupplyHook,
  useTokenHook,
  useTokensHook,
  useFetchListCallback,
  useHederaTokenAssociated,
  useHederaApproveCallback,
  useCurrency,
  usePair,
  useToken,
};

export { ApprovalState };

export type { TokenReturnType } from 'src/hooks/tokens/constant';
