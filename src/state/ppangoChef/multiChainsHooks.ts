import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import {
  useDummyPangoChefInfos,
  useDummyPangoChefStakeCallback,
  useEVMPangoChefStakeCallback,
  useHederaPangoChefInfos,
  useHederaPangoChefStakeCallback,
  usePangoChefInfos,
} from './hooks';

export type UsePangoChefInfosHookType = {
  [chainId in ChainId]:
    | typeof usePangoChefInfos
    | typeof useHederaPangoChefInfos
    | typeof useDummyPangoChefInfos
    | typeof useDummyHook;
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
};

export type UsePangoChefStakeCallbackHookType = {
  [chainId in ChainId]:
    | typeof useEVMPangoChefStakeCallback
    | typeof useHederaPangoChefStakeCallback
    | typeof useDummyPangoChefStakeCallback;
};

export const usePangoChefStakeCallbackHook: UsePangoChefStakeCallbackHookType = {
  [ChainId.FUJI]: useEVMPangoChefStakeCallback,
  [ChainId.AVALANCHE]: useEVMPangoChefStakeCallback,
  [ChainId.WAGMI]: useEVMPangoChefStakeCallback,
  [ChainId.COSTON]: useEVMPangoChefStakeCallback,
  [ChainId.SONGBIRD]: useEVMPangoChefStakeCallback,
  [ChainId.HEDERA_TESTNET]: useHederaPangoChefStakeCallback,
  [ChainId.NEAR_MAINNET]: useDummyPangoChefStakeCallback,
  [ChainId.NEAR_TESTNET]: useDummyPangoChefStakeCallback,
  [ChainId.ETHEREUM]: useDummyPangoChefStakeCallback,
  [ChainId.POLYGON]: useDummyPangoChefStakeCallback,
  [ChainId.FANTOM]: useDummyPangoChefStakeCallback,
  [ChainId.XDAI]: useDummyPangoChefStakeCallback,
  [ChainId.BSC]: useDummyPangoChefStakeCallback,
  [ChainId.ARBITRUM]: useDummyPangoChefStakeCallback,
  [ChainId.CELO]: useDummyPangoChefStakeCallback,
  [ChainId.OKXCHAIN]: useDummyPangoChefStakeCallback,
  [ChainId.VELAS]: useDummyPangoChefStakeCallback,
  [ChainId.AURORA]: useDummyPangoChefStakeCallback,
  [ChainId.CRONOS]: useDummyPangoChefStakeCallback,
  [ChainId.FUSE]: useDummyPangoChefStakeCallback,
  [ChainId.MOONRIVER]: useDummyPangoChefStakeCallback,
  [ChainId.MOONBEAM]: useDummyPangoChefStakeCallback,
  [ChainId.OP]: useDummyPangoChefStakeCallback,
};
