import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import {
  useDummyPangoChefCallback,
  useDummyPangoChefInfos,
  useEVMPangoChefClaimRewardCallback,
  useEVMPangoChefStakeCallback,
  useEVMPangoChefWithdrawCallback,
  useHederaPangoChefClaimRewardCallback,
  useHederaPangoChefInfos,
  useHederaPangoChefStakeCallback,
  useHederaPangoChefWithdrawCallback,
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
  [ChainId.COSTON2]: usePangoChefInfos,
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
    | typeof useDummyPangoChefCallback;
};

export const usePangoChefStakeCallbackHook: UsePangoChefStakeCallbackHookType = {
  [ChainId.FUJI]: useEVMPangoChefStakeCallback,
  [ChainId.AVALANCHE]: useEVMPangoChefStakeCallback,
  [ChainId.WAGMI]: useEVMPangoChefStakeCallback,
  [ChainId.COSTON]: useEVMPangoChefStakeCallback,
  [ChainId.SONGBIRD]: useEVMPangoChefStakeCallback,
  [ChainId.HEDERA_TESTNET]: useHederaPangoChefStakeCallback,
  [ChainId.NEAR_MAINNET]: useDummyPangoChefCallback,
  [ChainId.NEAR_TESTNET]: useDummyPangoChefCallback,
  [ChainId.COSTON2]: useEVMPangoChefStakeCallback,
  [ChainId.ETHEREUM]: useDummyPangoChefCallback,
  [ChainId.POLYGON]: useDummyPangoChefCallback,
  [ChainId.FANTOM]: useDummyPangoChefCallback,
  [ChainId.XDAI]: useDummyPangoChefCallback,
  [ChainId.BSC]: useDummyPangoChefCallback,
  [ChainId.ARBITRUM]: useDummyPangoChefCallback,
  [ChainId.CELO]: useDummyPangoChefCallback,
  [ChainId.OKXCHAIN]: useDummyPangoChefCallback,
  [ChainId.VELAS]: useDummyPangoChefCallback,
  [ChainId.AURORA]: useDummyPangoChefCallback,
  [ChainId.CRONOS]: useDummyPangoChefCallback,
  [ChainId.FUSE]: useDummyPangoChefCallback,
  [ChainId.MOONRIVER]: useDummyPangoChefCallback,
  [ChainId.MOONBEAM]: useDummyPangoChefCallback,
  [ChainId.OP]: useDummyPangoChefCallback,
};

export type UsePangoChefClaimRewardCallbackHookType = {
  [chainId in ChainId]:
    | typeof useEVMPangoChefClaimRewardCallback
    | typeof useHederaPangoChefClaimRewardCallback
    | typeof useDummyPangoChefCallback;
};

export const usePangoChefClaimRewardCallbackHook: UsePangoChefClaimRewardCallbackHookType = {
  [ChainId.FUJI]: useEVMPangoChefClaimRewardCallback,
  [ChainId.AVALANCHE]: useEVMPangoChefClaimRewardCallback,
  [ChainId.WAGMI]: useEVMPangoChefClaimRewardCallback,
  [ChainId.COSTON]: useEVMPangoChefClaimRewardCallback,
  [ChainId.SONGBIRD]: useEVMPangoChefClaimRewardCallback,
  [ChainId.HEDERA_TESTNET]: useHederaPangoChefClaimRewardCallback,
  [ChainId.NEAR_MAINNET]: useDummyPangoChefCallback,
  [ChainId.NEAR_TESTNET]: useDummyPangoChefCallback,
  [ChainId.COSTON2]: useEVMPangoChefClaimRewardCallback,
  [ChainId.ETHEREUM]: useDummyPangoChefCallback,
  [ChainId.POLYGON]: useDummyPangoChefCallback,
  [ChainId.FANTOM]: useDummyPangoChefCallback,
  [ChainId.XDAI]: useDummyPangoChefCallback,
  [ChainId.BSC]: useDummyPangoChefCallback,
  [ChainId.ARBITRUM]: useDummyPangoChefCallback,
  [ChainId.CELO]: useDummyPangoChefCallback,
  [ChainId.OKXCHAIN]: useDummyPangoChefCallback,
  [ChainId.VELAS]: useDummyPangoChefCallback,
  [ChainId.AURORA]: useDummyPangoChefCallback,
  [ChainId.CRONOS]: useDummyPangoChefCallback,
  [ChainId.FUSE]: useDummyPangoChefCallback,
  [ChainId.MOONRIVER]: useDummyPangoChefCallback,
  [ChainId.MOONBEAM]: useDummyPangoChefCallback,
  [ChainId.OP]: useDummyPangoChefCallback,
};

export type UsePangoChefWithdrawCallbackHookType = {
  [chainId in ChainId]:
    | typeof useEVMPangoChefWithdrawCallback
    | typeof useHederaPangoChefWithdrawCallback
    | typeof useDummyPangoChefCallback;
};

export const usePangoChefWithdrawCallbackHook: UsePangoChefWithdrawCallbackHookType = {
  [ChainId.FUJI]: useEVMPangoChefWithdrawCallback,
  [ChainId.AVALANCHE]: useEVMPangoChefWithdrawCallback,
  [ChainId.WAGMI]: useEVMPangoChefWithdrawCallback,
  [ChainId.COSTON]: useEVMPangoChefWithdrawCallback,
  [ChainId.SONGBIRD]: useEVMPangoChefWithdrawCallback,
  [ChainId.HEDERA_TESTNET]: useHederaPangoChefWithdrawCallback,
  [ChainId.NEAR_MAINNET]: useDummyPangoChefCallback,
  [ChainId.NEAR_TESTNET]: useDummyPangoChefCallback,
  [ChainId.COSTON2]: useEVMPangoChefWithdrawCallback,
  [ChainId.ETHEREUM]: useDummyPangoChefCallback,
  [ChainId.POLYGON]: useDummyPangoChefCallback,
  [ChainId.FANTOM]: useDummyPangoChefCallback,
  [ChainId.XDAI]: useDummyPangoChefCallback,
  [ChainId.BSC]: useDummyPangoChefCallback,
  [ChainId.ARBITRUM]: useDummyPangoChefCallback,
  [ChainId.CELO]: useDummyPangoChefCallback,
  [ChainId.OKXCHAIN]: useDummyPangoChefCallback,
  [ChainId.VELAS]: useDummyPangoChefCallback,
  [ChainId.AURORA]: useDummyPangoChefCallback,
  [ChainId.CRONOS]: useDummyPangoChefCallback,
  [ChainId.FUSE]: useDummyPangoChefCallback,
  [ChainId.MOONRIVER]: useDummyPangoChefCallback,
  [ChainId.MOONBEAM]: useDummyPangoChefCallback,
  [ChainId.OP]: useDummyPangoChefCallback,
};
