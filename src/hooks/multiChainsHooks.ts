import { ChainId } from '@pangolindex/sdk';
import { useNearToken, useNearTokens, useToken, useTokens } from './Tokens';
import {
  useApproveCallback,
  useApproveCallbackFromNearTrade,
  useApproveCallbackFromTrade,
  useNearApproveCallback,
} from './useApproveCallback';
import { useNearSwapCallback, useSwapCallback } from './useSwapCallback';
import { useDummySongbirdUSDCPrice, useNearUSDCPrice, useUSDCPrice } from './useUSDCPrice';
import { useWrapCallback, useWrapNearCallback } from './useWrapCallback';

export type useWrapCallbackHookType = {
  [chainId in ChainId]: typeof useWrapCallback | typeof useWrapNearCallback;
};

export const useWrapCallbackHook: useWrapCallbackHookType = {
  [ChainId.FUJI]: useWrapCallback,
  [ChainId.AVALANCHE]: useWrapCallback,
  [ChainId.WAGMI]: useWrapCallback,
  [ChainId.COSTON]: useWrapCallback,
  [ChainId.SONGBIRD]: useWrapCallback,
  [ChainId.NEAR_MAINNET]: useWrapNearCallback,
  [ChainId.NEAR_TESTNET]: useWrapNearCallback,
};

export type useTokenHookType = {
  [chainId in ChainId]: typeof useToken | typeof useNearToken;
};

export const useTokenHook: useTokenHookType = {
  [ChainId.FUJI]: useToken,
  [ChainId.AVALANCHE]: useToken,
  [ChainId.WAGMI]: useToken,
  [ChainId.COSTON]: useToken,
  [ChainId.SONGBIRD]: useToken,
  [ChainId.NEAR_MAINNET]: useNearToken,
  [ChainId.NEAR_TESTNET]: useNearToken,
};

export type useApproveCallbackFromTradeHookType = {
  [chainId in ChainId]: typeof useApproveCallbackFromTrade | typeof useApproveCallbackFromNearTrade;
};

export const useApproveCallbackFromTradeHook: useApproveCallbackFromTradeHookType = {
  [ChainId.FUJI]: useApproveCallbackFromTrade,
  [ChainId.AVALANCHE]: useApproveCallbackFromTrade,
  [ChainId.WAGMI]: useApproveCallbackFromTrade,
  [ChainId.COSTON]: useApproveCallbackFromTrade,
  [ChainId.SONGBIRD]: useApproveCallbackFromTrade,
  [ChainId.NEAR_MAINNET]: useApproveCallbackFromNearTrade,
  [ChainId.NEAR_TESTNET]: useApproveCallbackFromNearTrade,
};

export type useSwapCallbackHookType = {
  [chainId in ChainId]: typeof useSwapCallback | typeof useNearSwapCallback;
};

export const useSwapCallbackHook: useSwapCallbackHookType = {
  [ChainId.FUJI]: useSwapCallback,
  [ChainId.AVALANCHE]: useSwapCallback,
  [ChainId.WAGMI]: useSwapCallback,
  [ChainId.COSTON]: useSwapCallback,
  [ChainId.SONGBIRD]: useSwapCallback,
  [ChainId.NEAR_MAINNET]: useNearSwapCallback,
  [ChainId.NEAR_TESTNET]: useNearSwapCallback,
};

export type useApproveCallbackHookType = {
  [chainId in ChainId]: typeof useApproveCallback | typeof useNearApproveCallback;
};

export const useApproveCallbackHook: useApproveCallbackHookType = {
  [ChainId.FUJI]: useApproveCallback,
  [ChainId.AVALANCHE]: useApproveCallback,
  [ChainId.WAGMI]: useApproveCallback,
  [ChainId.COSTON]: useApproveCallback,
  [ChainId.SONGBIRD]: useApproveCallback,
  [ChainId.NEAR_MAINNET]: useNearApproveCallback,
  [ChainId.NEAR_TESTNET]: useNearApproveCallback,
};

export type useUSDCPriceHookType = {
  [chainId in ChainId]: typeof useUSDCPrice | typeof useNearUSDCPrice | typeof useDummySongbirdUSDCPrice;
};

export const useUSDCPriceHook: useUSDCPriceHookType = {
  [ChainId.FUJI]: useUSDCPrice,
  [ChainId.AVALANCHE]: useUSDCPrice,
  [ChainId.WAGMI]: useUSDCPrice,
  [ChainId.COSTON]: useUSDCPrice,
  [ChainId.SONGBIRD]: useDummySongbirdUSDCPrice,
  [ChainId.NEAR_MAINNET]: useNearUSDCPrice,
  [ChainId.NEAR_TESTNET]: useNearUSDCPrice,
};

export type useTokensHookType = {
  [chainId in ChainId]: typeof useTokens | typeof useNearTokens;
};

export const useTokensHook: useTokensHookType = {
  [ChainId.FUJI]: useTokens,
  [ChainId.AVALANCHE]: useTokens,
  [ChainId.WAGMI]: useTokens,
  [ChainId.COSTON]: useTokens,
  [ChainId.SONGBIRD]: useTokens,
  [ChainId.NEAR_MAINNET]: useNearTokens,
  [ChainId.NEAR_TESTNET]: useNearTokens,
};
