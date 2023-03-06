import { ChainId } from '@pangolindex/sdk';
import { useApproveCallback, useApproveCallbackFromTrade } from './evm';
import { useApproveCallbackFromHederaTrade, useHederaApproveCallback } from './hedera';
import { useApproveCallbackFromNearTrade, useNearApproveCallback } from './near';

export type UseApproveCallbackFromTradeHookType = {
  [chainId in ChainId]:
    | typeof useApproveCallbackFromTrade
    | typeof useApproveCallbackFromNearTrade
    | typeof useApproveCallbackFromHederaTrade;
};

export const useApproveCallbackFromTradeHook: UseApproveCallbackFromTradeHookType = {
  [ChainId.FUJI]: useApproveCallbackFromTrade,
  [ChainId.AVALANCHE]: useApproveCallbackFromTrade,
  [ChainId.WAGMI]: useApproveCallbackFromTrade,
  [ChainId.COSTON]: useApproveCallbackFromTrade,
  [ChainId.SONGBIRD]: useApproveCallbackFromTrade,
  [ChainId.FLARE_MAINNET]: useApproveCallbackFromTrade,
  [ChainId.HEDERA_TESTNET]: useApproveCallbackFromHederaTrade,
  [ChainId.HEDERA_MAINNET]: useApproveCallbackFromHederaTrade,
  [ChainId.NEAR_MAINNET]: useApproveCallbackFromNearTrade,
  [ChainId.NEAR_TESTNET]: useApproveCallbackFromNearTrade,
  [ChainId.COSTON2]: useApproveCallbackFromTrade,
  [ChainId.EVMOS_TESTNET]: useApproveCallbackFromTrade,
  [ChainId.EVMOS_MAINNET]: useApproveCallbackFromTrade,
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useApproveCallbackFromTrade,
  [ChainId.POLYGON]: useApproveCallbackFromTrade,
  [ChainId.FANTOM]: useApproveCallbackFromTrade,
  [ChainId.XDAI]: useApproveCallbackFromTrade,
  [ChainId.BSC]: useApproveCallbackFromTrade,
  [ChainId.ARBITRUM]: useApproveCallbackFromTrade,
  [ChainId.CELO]: useApproveCallbackFromTrade,
  [ChainId.OKXCHAIN]: useApproveCallbackFromTrade,
  [ChainId.VELAS]: useApproveCallbackFromTrade,
  [ChainId.AURORA]: useApproveCallbackFromTrade,
  [ChainId.CRONOS]: useApproveCallbackFromTrade,
  [ChainId.FUSE]: useApproveCallbackFromTrade,
  [ChainId.MOONRIVER]: useApproveCallbackFromTrade,
  [ChainId.MOONBEAM]: useApproveCallbackFromTrade,
  [ChainId.OP]: useApproveCallbackFromTrade,
};

export type UseApproveCallbackHookType = {
  [chainId in ChainId]: typeof useApproveCallback | typeof useNearApproveCallback | typeof useHederaApproveCallback;
};

export const useApproveCallbackHook: UseApproveCallbackHookType = {
  [ChainId.FUJI]: useApproveCallback,
  [ChainId.AVALANCHE]: useApproveCallback,
  [ChainId.WAGMI]: useApproveCallback,
  [ChainId.COSTON]: useApproveCallback,
  [ChainId.SONGBIRD]: useApproveCallback,
  [ChainId.FLARE_MAINNET]: useApproveCallback,
  [ChainId.HEDERA_TESTNET]: useHederaApproveCallback,
  [ChainId.HEDERA_MAINNET]: useHederaApproveCallback,
  [ChainId.NEAR_MAINNET]: useNearApproveCallback,
  [ChainId.NEAR_TESTNET]: useNearApproveCallback,
  [ChainId.COSTON2]: useApproveCallback,
  [ChainId.EVMOS_TESTNET]: useApproveCallback,
  [ChainId.EVMOS_MAINNET]: useApproveCallback,
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useApproveCallback,
  [ChainId.POLYGON]: useApproveCallback,
  [ChainId.FANTOM]: useApproveCallback,
  [ChainId.XDAI]: useApproveCallback,
  [ChainId.BSC]: useApproveCallback,
  [ChainId.ARBITRUM]: useApproveCallback,
  [ChainId.CELO]: useApproveCallback,
  [ChainId.OKXCHAIN]: useApproveCallback,
  [ChainId.VELAS]: useApproveCallback,
  [ChainId.AURORA]: useApproveCallback,
  [ChainId.CRONOS]: useApproveCallback,
  [ChainId.FUSE]: useApproveCallback,
  [ChainId.MOONRIVER]: useApproveCallback,
  [ChainId.MOONBEAM]: useApproveCallback,
  [ChainId.OP]: useApproveCallback,
};
