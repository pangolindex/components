import { useDummyHook } from '@honeycomb-finance/shared';
import { ChainId } from '@pangolindex/sdk';
import { useTotalSupply } from './evm';
import { useHederaTotalSupply } from './hedera';
import { useNearTotalSupply } from './near';

export type UseTotalSupplyHookType = {
  [chainId in ChainId]:
    | typeof useTotalSupply
    | typeof useNearTotalSupply
    | typeof useDummyHook
    | typeof useHederaTotalSupply;
};

/**
 * this hook is used to fetch total supply of given token based on chain
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export const useTotalSupplyHook: UseTotalSupplyHookType = {
  [ChainId.FUJI]: useTotalSupply,
  [ChainId.AVALANCHE]: useTotalSupply,
  [ChainId.WAGMI]: useTotalSupply,
  [ChainId.COSTON]: useTotalSupply,
  [ChainId.SONGBIRD]: useTotalSupply,
  [ChainId.FLARE_MAINNET]: useTotalSupply,
  [ChainId.HEDERA_TESTNET]: useHederaTotalSupply,
  [ChainId.HEDERA_MAINNET]: useHederaTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearTotalSupply,
  [ChainId.COSTON2]: useTotalSupply,
  [ChainId.EVMOS_TESTNET]: useTotalSupply,
  [ChainId.EVMOS_MAINNET]: useTotalSupply,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useTotalSupply,
};

export { useTotalSupply, useHederaTotalSupply, useNearTotalSupply };
