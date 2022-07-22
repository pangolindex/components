import { ChainId } from '@pangolindex/sdk';
import { createAction } from '@reduxjs/toolkit';
import { MinichefV2 } from './types';

export const updateMinichefStakingAllData = createAction<{
  data: { chainId: ChainId; data: MinichefV2 };
}>('pstake/updateMinichefStakingAllData');

export const updateMinichefStakingAllAprs = createAction<{
  data: { chainId: ChainId; data: any };
}>('pstake/updateMinichefStakingAllAprs');

export const updateMinichefStakingAllFarmsEarnedAmount = createAction<{
  data: { chainId: ChainId; data: any };
}>('pstake/updateMinichefStakingAllFarmsEarnedAmount');
