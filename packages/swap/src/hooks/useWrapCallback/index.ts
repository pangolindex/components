import { ChainId } from '@pangolindex/sdk';
import { useWrapCallback } from './evm';
import { useWrapHbarCallback } from './hedera';
import { useWrapNearCallback } from './near';

export type UseWrapCallbackHookType = {
  [chainId in ChainId]: typeof useWrapCallback | typeof useWrapNearCallback | typeof useWrapHbarCallback;
};

export const useWrapCallbackHook: UseWrapCallbackHookType = {
  [ChainId.FUJI]: useWrapCallback,
  [ChainId.AVALANCHE]: useWrapCallback,
  [ChainId.WAGMI]: useWrapCallback,
  [ChainId.COSTON]: useWrapCallback,
  [ChainId.SONGBIRD]: useWrapCallback,
  [ChainId.FLARE_MAINNET]: useWrapCallback,
  [ChainId.HEDERA_TESTNET]: useWrapHbarCallback,
  [ChainId.HEDERA_MAINNET]: useWrapHbarCallback,
  [ChainId.NEAR_MAINNET]: useWrapNearCallback,
  [ChainId.NEAR_TESTNET]: useWrapNearCallback,
  [ChainId.COSTON2]: useWrapCallback,
  [ChainId.EVMOS_TESTNET]: useWrapCallback,
  [ChainId.EVMOS_MAINNET]: useWrapCallback,
  // TODO: Remove these hooks later on
  [ChainId.ETHEREUM]: useWrapCallback,
  [ChainId.POLYGON]: useWrapCallback,
  [ChainId.FANTOM]: useWrapCallback,
  [ChainId.XDAI]: useWrapCallback,
  [ChainId.BSC]: useWrapCallback,
  [ChainId.ARBITRUM]: useWrapCallback,
  [ChainId.CELO]: useWrapCallback,
  [ChainId.OKXCHAIN]: useWrapCallback,
  [ChainId.VELAS]: useWrapCallback,
  [ChainId.AURORA]: useWrapCallback,
  [ChainId.CRONOS]: useWrapCallback,
  [ChainId.FUSE]: useWrapCallback,
  [ChainId.MOONRIVER]: useWrapCallback,
  [ChainId.MOONBEAM]: useWrapCallback,
  [ChainId.OP]: useWrapCallback,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useWrapCallback,
};
