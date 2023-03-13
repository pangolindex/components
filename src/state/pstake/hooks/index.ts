import { ChainId } from '@pangolindex/sdk';
import { useDummyMinichefHook } from './dummy';
import { useGetMinichefStakingInfosViaSubgraph, useMinichefStakingInfos } from './evm';

export type UseMinichefStakingInfosHookType = {
  [chainId in ChainId]:
    | typeof useMinichefStakingInfos
    | typeof useDummyMinichefHook
    | typeof useGetMinichefStakingInfosViaSubgraph;
};

export const useMinichefStakingInfosHook: UseMinichefStakingInfosHookType = {
  [ChainId.FUJI]: useMinichefStakingInfos,
  [ChainId.AVALANCHE]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.WAGMI]: useMinichefStakingInfos,
  [ChainId.COSTON]: useDummyMinichefHook,
  [ChainId.SONGBIRD]: useDummyMinichefHook,
  [ChainId.FLARE_MAINNET]: useDummyMinichefHook,
  [ChainId.HEDERA_TESTNET]: useDummyMinichefHook,
  [ChainId.HEDERA_MAINNET]: useDummyMinichefHook,
  [ChainId.NEAR_MAINNET]: useDummyMinichefHook,
  [ChainId.NEAR_TESTNET]: useDummyMinichefHook,
  [ChainId.COSTON2]: useDummyMinichefHook,
  [ChainId.ETHEREUM]: useDummyMinichefHook,
  [ChainId.POLYGON]: useDummyMinichefHook,
  [ChainId.FANTOM]: useDummyMinichefHook,
  [ChainId.XDAI]: useDummyMinichefHook,
  [ChainId.BSC]: useDummyMinichefHook,
  [ChainId.ARBITRUM]: useDummyMinichefHook,
  [ChainId.CELO]: useDummyMinichefHook,
  [ChainId.OKXCHAIN]: useDummyMinichefHook,
  [ChainId.VELAS]: useDummyMinichefHook,
  [ChainId.AURORA]: useDummyMinichefHook,
  [ChainId.CRONOS]: useDummyMinichefHook,
  [ChainId.FUSE]: useDummyMinichefHook,
  [ChainId.MOONRIVER]: useDummyMinichefHook,
  [ChainId.MOONBEAM]: useDummyMinichefHook,
  [ChainId.OP]: useDummyMinichefHook,
  [ChainId.EVMOS_TESTNET]: useDummyMinichefHook,
  [ChainId.EVMOS_MAINNET]: useDummyMinichefHook,
};
