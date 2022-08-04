import { ChainId } from '@pangolindex/sdk';
import { useNearToken, useToken } from './Tokens';
import {
  useApproveCallback,
  useApproveCallbackFromNearTrade,
  useApproveCallbackFromTrade,
  useNearApproveCallback,
} from './useApproveCallback';
import { useNearSwapCallback, useSwapCallback } from './useSwapCallback';
import { useNearUSDCPrice, useUSDCPrice } from './useUSDCPrice';
import { useWrapCallback, useWrapNearCallback } from './useWrapCallback';

export const useWrapCallbackHook = {
  [ChainId.FUJI]: useWrapCallback,
  [ChainId.AVALANCHE]: useWrapCallback,
  [ChainId.WAGMI]: useWrapCallback,
  [ChainId.COSTON]: useWrapCallback,
  [ChainId.NEAR_MAINNET]: useWrapNearCallback,
  [ChainId.NEAR_TESTNET]: useWrapNearCallback,
};

export const useTokenHook = {
  [ChainId.FUJI]: useToken,
  [ChainId.AVALANCHE]: useToken,
  [ChainId.WAGMI]: useToken,
  [ChainId.COSTON]: useToken,
  [ChainId.NEAR_MAINNET]: useNearToken,
  [ChainId.NEAR_TESTNET]: useNearToken,
};

export const useApproveCallbackFromTradeHook = {
  [ChainId.FUJI]: useApproveCallbackFromTrade,
  [ChainId.AVALANCHE]: useApproveCallbackFromTrade,
  [ChainId.WAGMI]: useApproveCallbackFromTrade,
  [ChainId.COSTON]: useApproveCallbackFromTrade,
  [ChainId.NEAR_MAINNET]: useApproveCallbackFromNearTrade,
  [ChainId.NEAR_TESTNET]: useApproveCallbackFromNearTrade,
};

export const useSwapCallbackHook = {
  [ChainId.FUJI]: useSwapCallback,
  [ChainId.AVALANCHE]: useSwapCallback,
  [ChainId.WAGMI]: useSwapCallback,
  [ChainId.COSTON]: useSwapCallback,
  [ChainId.NEAR_MAINNET]: useNearSwapCallback,
  [ChainId.NEAR_TESTNET]: useNearSwapCallback,
};

export const useApproveCallbackHook = {
  [ChainId.FUJI]: useApproveCallback,
  [ChainId.AVALANCHE]: useApproveCallback,
  [ChainId.WAGMI]: useApproveCallback,
  [ChainId.COSTON]: useApproveCallback,
  [ChainId.NEAR_MAINNET]: useNearApproveCallback,
  [ChainId.NEAR_TESTNET]: useNearApproveCallback,
};

export const useUSDCPricekHook = {
  [ChainId.FUJI]: useUSDCPrice,
  [ChainId.AVALANCHE]: useUSDCPrice,
  [ChainId.WAGMI]: useUSDCPrice,
  [ChainId.COSTON]: useUSDCPrice,
  [ChainId.NEAR_MAINNET]: useNearUSDCPrice,
  [ChainId.NEAR_TESTNET]: useNearUSDCPrice,
};
