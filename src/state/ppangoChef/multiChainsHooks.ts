import { ChainId } from '@pangolindex/sdk';
import { usePangoChefInfos, useDummyPangoChefInfos } from './hooks';

export type UsePangoChefInfosHookType = {
  [chainId in ChainId]: typeof usePangoChefInfos | typeof useDummyPangoChefInfos;
};

export const usePangoChefInfosHook: UsePangoChefInfosHookType = {
  [ChainId.FUJI]: useDummyPangoChefInfos,
  [ChainId.AVALANCHE]: useDummyPangoChefInfos,
  [ChainId.WAGMI]: useDummyPangoChefInfos,
  [ChainId.COSTON]: usePangoChefInfos,
  [ChainId.SONGBIRD]: usePangoChefInfos,
  [ChainId.HEDERA_TESTNET]: useDummyPangoChefInfos,
  [ChainId.NEAR_MAINNET]: useDummyPangoChefInfos,
  [ChainId.NEAR_TESTNET]: useDummyPangoChefInfos,
};
