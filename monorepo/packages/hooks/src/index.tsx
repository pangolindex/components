import useParsedQueryString from 'src/hooks/useParsedQueryString';
import { useOnClickOutside } from 'src/useOnClickOutside';
import { useChainId, useLibrary, usePangolinWeb3 } from './provider';
import { useApproveCallbackFromTradeHook, useApproveCallbackHook } from './useApproveCallback';
import { ApprovalState } from './useApproveCallback/constant';
import { useApproveCallback } from './useApproveCallback/evm';
import useDebounce from './useDebounce';
import useDummyHook from './useDummyHook';
import useENS from './useENS';
import useTransactionDeadline from './useTransactionDeadline';
import { useUSDCPriceHook } from './useUSDCPrice';
import { useUSDCPrice } from './useUSDCPrice/evm';

// hooks
export {
  usePangolinWeb3,
  useChainId,
  useLibrary,
  useUSDCPrice,
  useUSDCPriceHook,
  useApproveCallbackHook,
  useApproveCallbackFromTradeHook,
  useApproveCallback,
  useTransactionDeadline,
  useENS,
  useDebounce,
  useDummyHook,
  useOnClickOutside,
  useParsedQueryString,
};

export { ApprovalState };

export * from './useContract';
