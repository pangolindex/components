/* eslint-disable max-lines */
import { ChainId } from '@pangolindex/sdk';
import {
  useDummyTokenCurrencyPrice,
  useDummyTokensCurrencyPrice,
  useTokenCurrencyPrice,
  useTokenCurrencyPriceSubgraph,
  useTokensCurrencyPrice,
  useTokensCurrencyPriceSubgraph,
} from './useCurrencyPrice';

export function useDummyHook() {
  return undefined;
}

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
  [ChainId.EVMOS_TESTNET]: useTokensCurrencyPrice,
  [ChainId.EVMOS_MAINNET]: useTokensCurrencyPrice,
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
  [ChainId.EVMOS_TESTNET]: useTokenCurrencyPrice,
  [ChainId.EVMOS_MAINNET]: useTokenCurrencyPrice,
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
