import { ChainId } from '@pangolindex/sdk';
import { usePoolTVL } from './evm';

export function useDummyPoolTVL() {
  return {
    isLoading: false,
    error: null,
  };
}

export type UsePoolTVLHookType = {
  [chainId in ChainId]: typeof usePoolTVL | typeof useDummyPoolTVL;
};

export const usePoolTVLHook: UsePoolTVLHookType = {
  [ChainId.FUJI]: usePoolTVL,
  [ChainId.AVALANCHE]: usePoolTVL,
  [ChainId.WAGMI]: useDummyPoolTVL,
  [ChainId.COSTON]: useDummyPoolTVL,
  [ChainId.SONGBIRD]: useDummyPoolTVL,
  [ChainId.FLARE_MAINNET]: useDummyPoolTVL,
  [ChainId.HEDERA_TESTNET]: useDummyPoolTVL,
  [ChainId.HEDERA_MAINNET]: useDummyPoolTVL,
  [ChainId.NEAR_MAINNET]: useDummyPoolTVL,
  [ChainId.NEAR_TESTNET]: useDummyPoolTVL,
  [ChainId.COSTON2]: useDummyPoolTVL,
  [ChainId.EVMOS_TESTNET]: usePoolTVL,
  [ChainId.EVMOS_MAINNET]: usePoolTVL,
  [ChainId.ETHEREUM]: useDummyPoolTVL,
  [ChainId.POLYGON]: useDummyPoolTVL,
  [ChainId.FANTOM]: useDummyPoolTVL,
  [ChainId.XDAI]: useDummyPoolTVL,
  [ChainId.BSC]: useDummyPoolTVL,
  [ChainId.ARBITRUM]: useDummyPoolTVL,
  [ChainId.CELO]: useDummyPoolTVL,
  [ChainId.OKXCHAIN]: useDummyPoolTVL,
  [ChainId.VELAS]: useDummyPoolTVL,
  [ChainId.AURORA]: useDummyPoolTVL,
  [ChainId.CRONOS]: useDummyPoolTVL,
  [ChainId.FUSE]: useDummyPoolTVL,
  [ChainId.MOONRIVER]: useDummyPoolTVL,
  [ChainId.MOONBEAM]: useDummyPoolTVL,
  [ChainId.OP]: useDummyPoolTVL,
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePoolTVL,
};
