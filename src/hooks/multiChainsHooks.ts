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

export function useDummyHook() {
  return undefined;
}

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
  // TODO: Remove these hooks later on
  [ChainId.ETHEREUM]: useWrapCallback,
  [ChainId.POLYGON]: useWrapCallback,
  [ChainId.FANTOM]: useWrapCallback,
  [ChainId.XDAI]: useWrapCallback,
  [ChainId.BSC]: useWrapCallback,
  [ChainId.ARBITRUM]: useWrapCallback,
  [ChainId.CELO]: useWrapCallback,
  [ChainId.OKXCHAIN]: useWrapCallback,
  [ChainId.VELAS]: useWrapCallback,
  [ChainId.AURORA]: useWrapCallback,
  [ChainId.CRONOS]: useWrapCallback,
  [ChainId.FUSE]: useWrapCallback,
  [ChainId.MOONRIVER]: useWrapCallback,
  [ChainId.MOONBEAM]: useWrapCallback,
  [ChainId.OP]: useWrapCallback,
};

export type UseTokenHookType = {
  [chainId in ChainId]: typeof useToken | typeof useNearToken | typeof useDummyHook;
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
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
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
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useApproveCallbackFromTrade,
  [ChainId.POLYGON]: useApproveCallbackFromTrade,
  [ChainId.FANTOM]: useApproveCallbackFromTrade,
  [ChainId.XDAI]: useApproveCallbackFromTrade,
  [ChainId.BSC]: useApproveCallbackFromTrade,
  [ChainId.ARBITRUM]: useApproveCallbackFromTrade,
  [ChainId.CELO]: useApproveCallbackFromTrade,
  [ChainId.OKXCHAIN]: useApproveCallbackFromTrade,
  [ChainId.VELAS]: useApproveCallbackFromTrade,
  [ChainId.AURORA]: useApproveCallbackFromTrade,
  [ChainId.CRONOS]: useApproveCallbackFromTrade,
  [ChainId.FUSE]: useApproveCallbackFromTrade,
  [ChainId.MOONRIVER]: useApproveCallbackFromTrade,
  [ChainId.MOONBEAM]: useApproveCallbackFromTrade,
  [ChainId.OP]: useApproveCallbackFromTrade,
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
  // TODO: Remove following lines
  [ChainId.ETHEREUM]: useSwapCallback,
  [ChainId.POLYGON]: useSwapCallback,
  [ChainId.FANTOM]: useSwapCallback,
  [ChainId.XDAI]: useSwapCallback,
  [ChainId.BSC]: useSwapCallback,
  [ChainId.ARBITRUM]: useSwapCallback,
  [ChainId.CELO]: useSwapCallback,
  [ChainId.OKXCHAIN]: useSwapCallback,
  [ChainId.VELAS]: useSwapCallback,
  [ChainId.AURORA]: useSwapCallback,
  [ChainId.CRONOS]: useSwapCallback,
  [ChainId.FUSE]: useSwapCallback,
  [ChainId.MOONRIVER]: useSwapCallback,
  [ChainId.MOONBEAM]: useSwapCallback,
  [ChainId.OP]: useSwapCallback,
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
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useApproveCallback,
  [ChainId.POLYGON]: useApproveCallback,
  [ChainId.FANTOM]: useApproveCallback,
  [ChainId.XDAI]: useApproveCallback,
  [ChainId.BSC]: useApproveCallback,
  [ChainId.ARBITRUM]: useApproveCallback,
  [ChainId.CELO]: useApproveCallback,
  [ChainId.OKXCHAIN]: useApproveCallback,
  [ChainId.VELAS]: useApproveCallback,
  [ChainId.AURORA]: useApproveCallback,
  [ChainId.CRONOS]: useApproveCallback,
  [ChainId.FUSE]: useApproveCallback,
  [ChainId.MOONRIVER]: useApproveCallback,
  [ChainId.MOONBEAM]: useApproveCallback,
  [ChainId.OP]: useApproveCallback,
};

export type UseUSDCPriceHookType = {
  [chainId in ChainId]:
    | typeof useUSDCPrice
    | typeof useNearUSDCPrice
    | typeof useSongBirdUSDPrice
    | typeof useDummyHook;
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
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
};

export type UseTokensHookType = {
  [chainId in ChainId]: typeof useTokens | typeof useNearTokens | typeof useDummyHook;
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
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
};
