import { ChainId } from '@pangolindex/sdk';
import { useNearToken, useNearTokens, useToken, useTokens } from './Tokens';
import {
  useApproveCallback,
  useApproveCallbackFromHederaTrade,
  useApproveCallbackFromNearTrade,
  useApproveCallbackFromTrade,
  useHederaApproveCallback,
  useNearApproveCallback,
} from './useApproveCallback';
import { useHederaSwapCallback, useNearSwapCallback, useSwapCallback } from './useSwapCallback';
import { useNearUSDCPrice, useSongBirdUSDPrice, useUSDCPrice } from './useUSDCPrice';
import { useWrapCallback, useWrapHbarCallback, useWrapNearCallback } from './useWrapCallback';

export type UseWrapCallbackHookType = {
  [chainId in ChainId]: typeof useWrapCallback | typeof useWrapNearCallback | typeof useWrapHbarCallback;
};

export const useWrapCallbackHook: UseWrapCallbackHookType = {
  [ChainId.FUJI]: useWrapCallback,
  [ChainId.AVALANCHE]: useWrapCallback,
  [ChainId.WAGMI]: useWrapCallback,
  [ChainId.COSTON]: useWrapCallback,
  [ChainId.SONGBIRD]: useWrapCallback,
  [ChainId.HEDERA_TESTNET]: useWrapHbarCallback,
  [ChainId.NEAR_MAINNET]: useWrapNearCallback,
  [ChainId.NEAR_TESTNET]: useWrapNearCallback,
};

export type UseTokenHookType = {
  [chainId in ChainId]: typeof useToken | typeof useNearToken;
};

export const useTokenHook: UseTokenHookType = {
  [ChainId.FUJI]: useToken,
  [ChainId.AVALANCHE]: useToken,
  [ChainId.WAGMI]: useToken,
  [ChainId.COSTON]: useToken,
  [ChainId.SONGBIRD]: useToken,
  [ChainId.HEDERA_TESTNET]: useToken,
  [ChainId.NEAR_MAINNET]: useNearToken,
  [ChainId.NEAR_TESTNET]: useNearToken,
};

export type UseApproveCallbackFromTradeHookType = {
  [chainId in ChainId]:
    | typeof useApproveCallbackFromTrade
    | typeof useApproveCallbackFromNearTrade
    | typeof useApproveCallbackFromHederaTrade;
};

export const useApproveCallbackFromTradeHook: UseApproveCallbackFromTradeHookType = {
  [ChainId.FUJI]: useApproveCallbackFromTrade,
  [ChainId.AVALANCHE]: useApproveCallbackFromTrade,
  [ChainId.WAGMI]: useApproveCallbackFromTrade,
  [ChainId.COSTON]: useApproveCallbackFromTrade,
  [ChainId.SONGBIRD]: useApproveCallbackFromTrade,
  [ChainId.HEDERA_TESTNET]: useApproveCallbackFromHederaTrade,
  [ChainId.NEAR_MAINNET]: useApproveCallbackFromNearTrade,
  [ChainId.NEAR_TESTNET]: useApproveCallbackFromNearTrade,
};

export type UseSwapCallbackHookType = {
  [chainId in ChainId]: typeof useSwapCallback | typeof useNearSwapCallback | typeof useHederaSwapCallback;
};

export const useSwapCallbackHook: UseSwapCallbackHookType = {
  [ChainId.FUJI]: useSwapCallback,
  [ChainId.AVALANCHE]: useSwapCallback,
  [ChainId.WAGMI]: useSwapCallback,
  [ChainId.COSTON]: useSwapCallback,
  [ChainId.SONGBIRD]: useSwapCallback,
  [ChainId.HEDERA_TESTNET]: useHederaSwapCallback,
  [ChainId.NEAR_MAINNET]: useNearSwapCallback,
  [ChainId.NEAR_TESTNET]: useNearSwapCallback,
};

export type UseApproveCallbackHookType = {
  [chainId in ChainId]: typeof useApproveCallback | typeof useNearApproveCallback | typeof useHederaApproveCallback;
};

export const useApproveCallbackHook: UseApproveCallbackHookType = {
  [ChainId.FUJI]: useApproveCallback,
  [ChainId.AVALANCHE]: useApproveCallback,
  [ChainId.WAGMI]: useApproveCallback,
  [ChainId.COSTON]: useApproveCallback,
  [ChainId.SONGBIRD]: useApproveCallback,
  [ChainId.HEDERA_TESTNET]: useHederaApproveCallback,
  [ChainId.NEAR_MAINNET]: useNearApproveCallback,
  [ChainId.NEAR_TESTNET]: useNearApproveCallback,
};

export type UseUSDCPriceHookType = {
  [chainId in ChainId]: typeof useUSDCPrice | typeof useNearUSDCPrice | typeof useSongBirdUSDPrice;
};

export const useUSDCPriceHook: UseUSDCPriceHookType = {
  [ChainId.FUJI]: useUSDCPrice,
  [ChainId.AVALANCHE]: useUSDCPrice,
  [ChainId.WAGMI]: useUSDCPrice,
  [ChainId.COSTON]: useUSDCPrice,
  [ChainId.SONGBIRD]: useSongBirdUSDPrice,
  [ChainId.HEDERA_TESTNET]: useUSDCPrice,
  [ChainId.NEAR_MAINNET]: useNearUSDCPrice,
  [ChainId.NEAR_TESTNET]: useNearUSDCPrice,
};

export type UseTokensHookType = {
  [chainId in ChainId]: typeof useTokens | typeof useNearTokens;
};

export const useTokensHook: UseTokensHookType = {
  [ChainId.FUJI]: useTokens,
  [ChainId.AVALANCHE]: useTokens,
  [ChainId.WAGMI]: useTokens,
  [ChainId.COSTON]: useTokens,
  [ChainId.SONGBIRD]: useTokens,
  [ChainId.HEDERA_TESTNET]: useTokens,
  [ChainId.NEAR_MAINNET]: useNearTokens,
  [ChainId.NEAR_TESTNET]: useNearTokens,
};
