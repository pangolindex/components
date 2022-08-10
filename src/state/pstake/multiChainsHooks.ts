import { ChainId, Pair } from '@pangolindex/sdk';
import {
  useDummyMinichefHook,
  useDummyMinichefStakingInfosViaSubgraph,
  useGetAllFarmData,
  useGetDummyAllFarmData,
  useGetMinichefStakingInfosViaSubgraph,
  useMinichefStakingInfos,
} from './hooks';
import { MinichefStakingInfo, StakingInfo } from './types';

export const useMinichefStakingInfosMapping: {
  [chainId in ChainId]: (version?: number, pairToFilterBy?: Pair | null) => StakingInfo[];
} = {
  [ChainId.FUJI]: useMinichefStakingInfos,
  [ChainId.AVALANCHE]: useMinichefStakingInfos,
  [ChainId.WAGMI]: useMinichefStakingInfos,
  [ChainId.COSTON]: useMinichefStakingInfos,
  [ChainId.NEAR_MAINNET]: useDummyMinichefHook,
  [ChainId.NEAR_TESTNET]: useDummyMinichefHook,
};

export const useGetMinichefStakingInfosViaSubgraphMapping: {
  [chainId in ChainId]: () => MinichefStakingInfo[];
} = {
  [ChainId.FUJI]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.AVALANCHE]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.WAGMI]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.COSTON]: useGetMinichefStakingInfosViaSubgraph,
  [ChainId.NEAR_MAINNET]: useDummyMinichefStakingInfosViaSubgraph,
  [ChainId.NEAR_TESTNET]: useDummyMinichefStakingInfosViaSubgraph,
};

export const useGetAllFarmDataHook = {
  [ChainId.FUJI]: useGetAllFarmData,
  [ChainId.AVALANCHE]: useGetAllFarmData,
  [ChainId.WAGMI]: useGetAllFarmData,
  [ChainId.COSTON]: useGetAllFarmData,
  [ChainId.NEAR_MAINNET]: useGetDummyAllFarmData,
  [ChainId.NEAR_TESTNET]: useGetDummyAllFarmData,
};
