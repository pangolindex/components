import { ChainId } from '@pangolindex/sdk';
import { useDummyPangoChefInfos, usePangoChefInfos, useHederaPangoChefInfos } from './hooks';

export type UsePangoChefInfosHookType = {
  [chainId in ChainId]: typeof usePangoChefInfos | typeof useHederaPangoChefInfos | typeof useDummyPangoChefInfos;
};

export const usePangoChefInfosHook: UsePangoChefInfosHookType = {
  [ChainId.FUJI]: useDummyPangoChefInfos,
  [ChainId.AVALANCHE]: useDummyPangoChefInfos,
  [ChainId.WAGMI]: useDummyPangoChefInfos,
  [ChainId.COSTON]: usePangoChefInfos,
  [ChainId.SONGBIRD]: usePangoChefInfos,
  [ChainId.HEDERA_TESTNET]: useHederaPangoChefInfos,
  [ChainId.NEAR_MAINNET]: useDummyPangoChefInfos,
  [ChainId.NEAR_TESTNET]: useDummyPangoChefInfos,
};
