import { Pair } from '@pangolindex/sdk';
import { MinichefStakingInfo, StakingInfo } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyMinichefHook = (_version?: number, _pairToFilterBy?: Pair | null) => {
  return [] as StakingInfo[];
};

export function useGetDummyAllFarmData() {
  // This is intentional
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyMinichefStakingInfosViaSubgraph = () => {
  return [] as MinichefStakingInfo[];
};
