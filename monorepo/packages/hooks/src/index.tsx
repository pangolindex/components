import { useOnClickOutside } from 'src/useOnClickOutside';
import useParsedQueryString from 'src/useParsedQueryString';
import { useChainId, useLibrary, usePangolinWeb3 } from './provider';
import { useApproveCallbackFromTradeHook, useApproveCallbackHook } from './useApproveCallback';
import { ApprovalState } from './useApproveCallback/constant';
import { useApproveCallback } from './useApproveCallback/evm';
import useDebounce from './useDebounce';
import useDummyHook from './useDummyHook';
import useENS from './useENS';
import { useEscapeKey } from './useEscapeKey';
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
  useEscapeKey,
};

export { ApprovalState };

export * from './useContract';
