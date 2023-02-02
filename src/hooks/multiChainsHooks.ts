/* eslint-disable max-lines */
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
import {
  useDummyTokenCurrencyPrice,
  useDummyTokensCurrencyPrice,
  useTokenCurrencyPrice,
  useTokenCurrencyPriceSubgraph,
  useTokensCurrencyPrice,
  useTokensCurrencyPriceSubgraph,
} from './useCurrencyPrice';
import { useHederaSwapCallback, useNearSwapCallback, useSwapCallback } from './useSwapCallback';
import { useNearUSDCPrice, useSongBirdUSDPrice, useUSDCPrice, useUsdPriceCoingecko } from './useUSDCPrice';
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
  [ChainId.FLARE_MAINNET]: useWrapCallback,
  [ChainId.HEDERA_TESTNET]: useWrapHbarCallback,
  [ChainId.HEDERA_MAINNET]: useWrapHbarCallback,
  [ChainId.NEAR_MAINNET]: useWrapNearCallback,
  [ChainId.NEAR_TESTNET]: useWrapNearCallback,
  [ChainId.COSTON2]: useWrapCallback,
  [ChainId.EVMOS_TESTNET]: useWrapCallback,
  [ChainId.EVMOS_MAINNET]: useWrapCallback,
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
  [ChainId.FLARE_MAINNET]: useToken,
  [ChainId.HEDERA_TESTNET]: useToken,
  [ChainId.HEDERA_MAINNET]: useToken,
  [ChainId.NEAR_MAINNET]: useNearToken,
  [ChainId.NEAR_TESTNET]: useNearToken,
  [ChainId.COSTON2]: useToken,
  [ChainId.EVMOS_TESTNET]: useToken,
  [ChainId.EVMOS_MAINNET]: useToken,
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
  [ChainId.FLARE_MAINNET]: useApproveCallbackFromTrade,
  [ChainId.HEDERA_TESTNET]: useApproveCallbackFromHederaTrade,
  [ChainId.HEDERA_MAINNET]: useApproveCallbackFromHederaTrade,
  [ChainId.NEAR_MAINNET]: useApproveCallbackFromNearTrade,
  [ChainId.NEAR_TESTNET]: useApproveCallbackFromNearTrade,
  [ChainId.COSTON2]: useApproveCallbackFromTrade,
  [ChainId.EVMOS_TESTNET]: useApproveCallbackFromTrade,
  [ChainId.EVMOS_MAINNET]: useApproveCallbackFromTrade,
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
  [ChainId.FLARE_MAINNET]: useSwapCallback,
  [ChainId.HEDERA_TESTNET]: useHederaSwapCallback,
  [ChainId.HEDERA_MAINNET]: useHederaSwapCallback,
  [ChainId.NEAR_MAINNET]: useNearSwapCallback,
  [ChainId.NEAR_TESTNET]: useNearSwapCallback,
  [ChainId.COSTON2]: useSwapCallback,
  [ChainId.EVMOS_TESTNET]: useSwapCallback,
  [ChainId.EVMOS_MAINNET]: useSwapCallback,
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
  [ChainId.FLARE_MAINNET]: useApproveCallback,
  [ChainId.HEDERA_TESTNET]: useHederaApproveCallback,
  [ChainId.HEDERA_MAINNET]: useHederaApproveCallback,
  [ChainId.NEAR_MAINNET]: useNearApproveCallback,
  [ChainId.NEAR_TESTNET]: useNearApproveCallback,
  [ChainId.COSTON2]: useApproveCallback,
  [ChainId.EVMOS_TESTNET]: useApproveCallback,
  [ChainId.EVMOS_MAINNET]: useApproveCallback,
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
    | typeof useUsdPriceCoingecko
    | typeof useDummyHook;
};

export const useUSDCPriceHook: UseUSDCPriceHookType = {
  [ChainId.FUJI]: useUSDCPrice,
  [ChainId.AVALANCHE]: useUSDCPrice,
  [ChainId.WAGMI]: useUSDCPrice,
  [ChainId.COSTON]: useUSDCPrice,
  [ChainId.SONGBIRD]: useSongBirdUSDPrice,
  [ChainId.FLARE_MAINNET]: useUsdPriceCoingecko,
  [ChainId.HEDERA_TESTNET]: useUsdPriceCoingecko,
  [ChainId.HEDERA_MAINNET]: useUsdPriceCoingecko,
  [ChainId.NEAR_MAINNET]: useNearUSDCPrice,
  [ChainId.NEAR_TESTNET]: useNearUSDCPrice,
  [ChainId.COSTON2]: useUSDCPrice,
  [ChainId.EVMOS_TESTNET]: useUSDCPrice,
  [ChainId.EVMOS_MAINNET]: useUSDCPrice,
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
  [ChainId.FLARE_MAINNET]: useTokens,
  [ChainId.HEDERA_TESTNET]: useTokens,
  [ChainId.HEDERA_MAINNET]: useTokens,
  [ChainId.NEAR_MAINNET]: useNearTokens,
  [ChainId.NEAR_TESTNET]: useNearTokens,
  [ChainId.COSTON2]: useTokens,
  [ChainId.EVMOS_TESTNET]: useTokens,
  [ChainId.EVMOS_MAINNET]: useTokens,
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

export type UseTokensCurrencyPriceHookType = {
  [chainId in ChainId]:
    | typeof useTokensCurrencyPrice
    | typeof useTokensCurrencyPriceSubgraph
    | typeof useDummyTokensCurrencyPrice;
};

export const useTokensCurrencyPriceHook: UseTokensCurrencyPriceHookType = {
  [ChainId.FUJI]: useDummyTokensCurrencyPrice,
  [ChainId.AVALANCHE]: useDummyTokensCurrencyPrice,
  [ChainId.WAGMI]: useDummyTokensCurrencyPrice,
  [ChainId.COSTON]: useTokensCurrencyPrice,
  [ChainId.SONGBIRD]: useTokensCurrencyPrice,
  [ChainId.FLARE_MAINNET]: useTokensCurrencyPrice,
  [ChainId.HEDERA_TESTNET]: useTokensCurrencyPriceSubgraph,
  [ChainId.HEDERA_MAINNET]: useTokensCurrencyPriceSubgraph,
  [ChainId.NEAR_MAINNET]: useDummyTokensCurrencyPrice,
  [ChainId.NEAR_TESTNET]: useDummyTokensCurrencyPrice,
  [ChainId.COSTON2]: useTokensCurrencyPrice,
  [ChainId.EVMOS_TESTNET]: useDummyTokensCurrencyPrice,
  [ChainId.EVMOS_MAINNET]: useDummyTokensCurrencyPrice,
  [ChainId.ETHEREUM]: useDummyTokensCurrencyPrice,
  [ChainId.POLYGON]: useDummyTokensCurrencyPrice,
  [ChainId.FANTOM]: useDummyTokensCurrencyPrice,
  [ChainId.XDAI]: useDummyTokensCurrencyPrice,
  [ChainId.BSC]: useDummyTokensCurrencyPrice,
  [ChainId.ARBITRUM]: useDummyTokensCurrencyPrice,
  [ChainId.CELO]: useDummyTokensCurrencyPrice,
  [ChainId.OKXCHAIN]: useDummyTokensCurrencyPrice,
  [ChainId.VELAS]: useDummyTokensCurrencyPrice,
  [ChainId.AURORA]: useDummyTokensCurrencyPrice,
  [ChainId.CRONOS]: useDummyTokensCurrencyPrice,
  [ChainId.FUSE]: useDummyTokensCurrencyPrice,
  [ChainId.MOONRIVER]: useDummyTokensCurrencyPrice,
  [ChainId.MOONBEAM]: useDummyTokensCurrencyPrice,
  [ChainId.OP]: useDummyTokensCurrencyPrice,
};

export type UseTokenCurrencyPriceType = {
  [chainId in ChainId]:
    | typeof useTokenCurrencyPrice
    | typeof useTokenCurrencyPriceSubgraph
    | typeof useDummyTokenCurrencyPrice;
};

export const useTokenCurrencyPriceHook: UseTokenCurrencyPriceType = {
  [ChainId.FUJI]: useDummyTokenCurrencyPrice,
  [ChainId.AVALANCHE]: useDummyTokenCurrencyPrice,
  [ChainId.WAGMI]: useDummyTokenCurrencyPrice,
  [ChainId.COSTON]: useTokenCurrencyPrice,
  [ChainId.SONGBIRD]: useTokenCurrencyPrice,
  [ChainId.FLARE_MAINNET]: useTokenCurrencyPrice,
  [ChainId.HEDERA_TESTNET]: useTokenCurrencyPriceSubgraph,
  [ChainId.HEDERA_MAINNET]: useTokenCurrencyPriceSubgraph,
  [ChainId.NEAR_MAINNET]: useDummyTokenCurrencyPrice,
  [ChainId.NEAR_TESTNET]: useDummyTokenCurrencyPrice,
  [ChainId.COSTON2]: useTokenCurrencyPrice,
  [ChainId.EVMOS_TESTNET]: useDummyTokenCurrencyPrice,
  [ChainId.EVMOS_MAINNET]: useDummyTokenCurrencyPrice,
  [ChainId.ETHEREUM]: useDummyTokenCurrencyPrice,
  [ChainId.POLYGON]: useDummyTokenCurrencyPrice,
  [ChainId.FANTOM]: useDummyTokenCurrencyPrice,
  [ChainId.XDAI]: useDummyTokenCurrencyPrice,
  [ChainId.BSC]: useDummyTokenCurrencyPrice,
  [ChainId.ARBITRUM]: useDummyTokenCurrencyPrice,
  [ChainId.CELO]: useDummyTokenCurrencyPrice,
  [ChainId.OKXCHAIN]: useDummyTokenCurrencyPrice,
  [ChainId.VELAS]: useDummyTokenCurrencyPrice,
  [ChainId.AURORA]: useDummyTokenCurrencyPrice,
  [ChainId.CRONOS]: useDummyTokenCurrencyPrice,
  [ChainId.FUSE]: useDummyTokenCurrencyPrice,
  [ChainId.MOONRIVER]: useDummyTokenCurrencyPrice,
  [ChainId.MOONBEAM]: useDummyTokenCurrencyPrice,
  [ChainId.OP]: useDummyTokenCurrencyPrice,
};
/* eslint-enable max-lines */
