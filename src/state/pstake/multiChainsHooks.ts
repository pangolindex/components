import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import {
  useDummyMinichefHook,
  useDummyMinichefStakingInfosViaSubgraph,
  useGetAllFarmData,
  useGetDummyAllFarmData,
  useGetMinichefStakingInfosViaSubgraph,
  useMinichefStakingInfos,
} from './hooks';

export type UseMinichefStakingInfosHookType = {
  [chainId in ChainId]: typeof useMinichefStakingInfos | typeof useDummyMinichefHook | typeof useDummyHook;
};

export const useMinichefStakingInfosHook: UseMinichefStakingInfosHookType = {
  [ChainId.FUJI]: useDummyMinichefHook,
  [ChainId.AVALANCHE]: useMinichefStakingInfos,
  [ChainId.WAGMI]: useMinichefStakingInfos,
  [ChainId.COSTON]: useDummyMinichefHook,
  [ChainId.SONGBIRD]: useDummyMinichefHook,
  [ChainId.FLARE_MAINNET]: useDummyMinichefHook,
  [ChainId.HEDERA_TESTNET]: useDummyMinichefHook,
  [ChainId.HEDERA_MAINNET]: useDummyMinichefHook,
  [ChainId.NEAR_MAINNET]: useDummyMinichefHook,
  [ChainId.NEAR_TESTNET]: useDummyMinichefHook,
  [ChainId.COSTON2]: useDummyMinichefHook,
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
  [ChainId.EVMOS_TESTNET]: useDummyMinichefHook,
  [ChainId.EVMOS_MAINNET]: useDummyMinichefHook,
};

export type UseGetMinichefStakingInfosViaSubgraphHookType = {
  [chainId in ChainId]:
    | typeof useGetMinichefStakingInfosViaSubgraph
    | typeof useDummyMinichefStakingInfosViaSubgraph
    | typeof useDummyHook;
};

export const useGetMinichefStakingInfosViaSubgraphHook: UseGetMinichefStakingInfosViaSubgraphHookType = {
  [ChainId.FUJI]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.AVALANCHE]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.WAGMI]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.COSTON]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.SONGBIRD]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.FLARE_MAINNET]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.HEDERA_TESTNET]: useDummyMinichefStakingInfosViaSubgraph,
  [ChainId.HEDERA_MAINNET]: useDummyMinichefStakingInfosViaSubgraph,
  [ChainId.NEAR_MAINNET]: useDummyMinichefStakingInfosViaSubgraph,
  [ChainId.NEAR_TESTNET]: useDummyMinichefStakingInfosViaSubgraph,
  [ChainId.COSTON2]: useGetMinichefStakingInfosViaSubgraph,
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
  [ChainId.EVMOS_TESTNET]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.EVMOS_MAINNET]: useGetMinichefStakingInfosViaSubgraph,
};

export type UseGetAllFarmDataHookType = {
  [chainId in ChainId]: typeof useGetAllFarmData | typeof useGetDummyAllFarmData | typeof useDummyHook;
};

export const useGetAllFarmDataHook: UseGetAllFarmDataHookType = {
  [ChainId.FUJI]: useGetDummyAllFarmData,
  [ChainId.AVALANCHE]: useGetAllFarmData,
  [ChainId.WAGMI]: useGetAllFarmData,
  [ChainId.COSTON]: useGetDummyAllFarmData,
  [ChainId.SONGBIRD]: useGetDummyAllFarmData,
  [ChainId.FLARE_MAINNET]: useGetDummyAllFarmData,
  [ChainId.HEDERA_TESTNET]: useGetDummyAllFarmData,
  [ChainId.HEDERA_MAINNET]: useGetDummyAllFarmData,
  [ChainId.NEAR_MAINNET]: useGetDummyAllFarmData,
  [ChainId.NEAR_TESTNET]: useGetDummyAllFarmData,
  [ChainId.COSTON2]: useGetDummyAllFarmData,
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
  [ChainId.EVMOS_TESTNET]: useGetAllFarmData,
  [ChainId.EVMOS_MAINNET]: useGetDummyAllFarmData,
};
