/* eslint-disable max-lines */
import { ChainId } from '@pangolindex/sdk';
import { useNearToken, useNearTokens, useToken, useTokens, useTokensViaSubGraph } from './Tokens';
import {
  useDummyTokenCurrencyPrice,
  useDummyTokensCurrencyPrice,
  useTokenCurrencyPrice,
  useTokenCurrencyPriceSubgraph,
  useTokensCurrencyPrice,
  useTokensCurrencyPriceSubgraph,
} from './useCurrencyPrice';
import { useNearUSDCPrice, useSongBirdUSDPrice, useUSDCPrice, useUsdPriceCoingecko } from './useUSDCPrice';

export function useDummyHook() {
  return undefined;
}

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
  [chainId in ChainId]: typeof useTokens | typeof useNearTokens | typeof useTokensViaSubGraph | typeof useDummyHook;
};

export const useTokensHook: UseTokensHookType = {
  [ChainId.FUJI]: useTokens,
  [ChainId.AVALANCHE]: useTokens,
  [ChainId.WAGMI]: useTokens,
  [ChainId.COSTON]: useTokens,
  [ChainId.SONGBIRD]: useTokens,
  [ChainId.FLARE_MAINNET]: useTokens,
  [ChainId.HEDERA_TESTNET]: useTokensViaSubGraph,
  [ChainId.HEDERA_MAINNET]: useTokensViaSubGraph,
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
