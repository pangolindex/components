import { Pair } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { MinichefStakingInfo } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const useDummyMinichefHook = (_version?: number, _pairToFilterBy?: Pair | null) => {
  return useMemo(() => [] as MinichefStakingInfo[], []);
};
