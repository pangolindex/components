import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from '@pangolindex/shared';
import { useEvmPairTotalSupply } from './evm';
import { useHederaPairTotalSupply, usePairTotalSupplyViaSubgraph } from './hedera';
import { useNearPairTotalSupply } from './near';

export type UsePairTotalSupplyHookType = {
  [chainId in ChainId]:
    | typeof useEvmPairTotalSupply
    | typeof useNearPairTotalSupply
    | typeof usePairTotalSupplyViaSubgraph
    | typeof useHederaPairTotalSupply
    | typeof useDummyHook;
};

/**
 * this hook is used to fetch total supply of given pair based on chain
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export const usePairTotalSupplyHook: UsePairTotalSupplyHookType = {
  [ChainId.FUJI]: useEvmPairTotalSupply,
  [ChainId.AVALANCHE]: useEvmPairTotalSupply,
  [ChainId.WAGMI]: useEvmPairTotalSupply,
  [ChainId.COSTON]: useEvmPairTotalSupply,
  [ChainId.SONGBIRD]: useEvmPairTotalSupply,
  [ChainId.FLARE_MAINNET]: useEvmPairTotalSupply,
  [ChainId.HEDERA_TESTNET]: useHederaPairTotalSupply,
  [ChainId.HEDERA_MAINNET]: useHederaPairTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearPairTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearPairTotalSupply,
  [ChainId.COSTON2]: useEvmPairTotalSupply,
  [ChainId.EVMOS_TESTNET]: useEvmPairTotalSupply,
  [ChainId.EVMOS_MAINNET]: useEvmPairTotalSupply,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useEvmPairTotalSupply,
};
