import { ChainId } from '@pangolindex/sdk';
import {
  useDummyMinichefHook,
  useDummyMinichefStakingInfosViaSubgraph,
  useGetAllFarmData,
  useGetDummyAllFarmData,
  useGetMinichefStakingInfosViaSubgraph,
  useMinichefStakingInfos,
} from './hooks';

export type UseMinichefStakingInfosHookType = {
  [chainId in ChainId]: typeof useMinichefStakingInfos | typeof useDummyMinichefHook;
};

export const useMinichefStakingInfosHook: UseMinichefStakingInfosHookType = {
  [ChainId.FUJI]: useMinichefStakingInfos,
  [ChainId.AVALANCHE]: useMinichefStakingInfos,
  [ChainId.WAGMI]: useMinichefStakingInfos,
  [ChainId.COSTON]: useDummyMinichefHook,
  [ChainId.SONGBIRD]: useDummyMinichefHook,
  [ChainId.NEAR_MAINNET]: useDummyMinichefHook,
  [ChainId.NEAR_TESTNET]: useDummyMinichefHook,
};

export type UseGetMinichefStakingInfosViaSubgraphHookType = {
  [chainId in ChainId]: typeof useGetMinichefStakingInfosViaSubgraph | typeof useDummyMinichefStakingInfosViaSubgraph;
};

export const useGetMinichefStakingInfosViaSubgraphHook: UseGetMinichefStakingInfosViaSubgraphHookType = {
  [ChainId.FUJI]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.AVALANCHE]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.WAGMI]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.COSTON]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.SONGBIRD]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.NEAR_MAINNET]: useDummyMinichefStakingInfosViaSubgraph,
  [ChainId.NEAR_TESTNET]: useDummyMinichefStakingInfosViaSubgraph,
};

export type UseGetAllFarmDataHookType = {
  [chainId in ChainId]: typeof useGetAllFarmData | typeof useGetDummyAllFarmData;
};

export const useGetAllFarmDataHook: UseGetAllFarmDataHookType = {
  [ChainId.FUJI]: useGetAllFarmData,
  [ChainId.AVALANCHE]: useGetAllFarmData,
  [ChainId.WAGMI]: useGetAllFarmData,
  [ChainId.COSTON]: useGetAllFarmData,
  [ChainId.SONGBIRD]: useGetAllFarmData,
  [ChainId.NEAR_MAINNET]: useGetDummyAllFarmData,
  [ChainId.NEAR_TESTNET]: useGetDummyAllFarmData,
};
