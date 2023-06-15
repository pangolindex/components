import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import { useUsdPriceCoingecko } from './coingecko';
import { useUSDCPrice } from './evm';
import { useNearUSDCPrice } from './near';
import { useSongBirdUSDPrice } from './songbird';

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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyHook,
};
