import { useAllTokens } from 'src/hooks/useAllTokens';
import { useApproveCallbackFromTradeHook, useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { useApproveCallback } from 'src/hooks/useApproveCallback/evm';
import { useHederaApproveCallback } from 'src/hooks/useApproveCallback/hedera';
import { useCurrency } from 'src/hooks/useCurrency';
import { useFetchListCallback } from 'src/hooks/useFetchListCallback';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice/evm';
import { useTokensCurrencyPriceHook } from './multiChainsHooks';

export * from './useTotalSupply';
export * from './usePair';
export * from './tokens';
export * from './useCurrencyPrice';


// hooks
export {
  useUSDCPrice,
  useUSDCPriceHook,
  useApproveCallbackHook,
  useApproveCallbackFromTradeHook,
  useApproveCallback,
  useTransactionDeadline,
  useParsedQueryString,
  useAllTokens,
  useFetchListCallback,
  useHederaApproveCallback,
  useCurrency,
  useTokensCurrencyPriceHook,
};

export { ApprovalState };
