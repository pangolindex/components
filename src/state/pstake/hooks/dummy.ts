import { Pair } from '@pangolindex/sdk';
import { MinichefStakingInfo } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyMinichefHook = (_version?: number, _pairToFilterBy?: Pair | null) => {
  return [] as MinichefStakingInfo[];
};
