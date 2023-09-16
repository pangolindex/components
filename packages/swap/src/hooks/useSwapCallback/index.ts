import { ChainId } from '@pangolindex/sdk';
import { useSwapCallback } from './evm';
import { useHederaSwapCallback } from './hedera';
import { useNearSwapCallback } from './near';

export type UseSwapCallbackHookType = {
  [chainId in ChainId]: typeof useSwapCallback | typeof useNearSwapCallback | typeof useHederaSwapCallback;
};

export const useSwapCallbackHook: UseSwapCallbackHookType = {
  [ChainId.FUJI]: useSwapCallback,
  [ChainId.AVALANCHE]: useSwapCallback,
  [ChainId.WAGMI]: useSwapCallback,
  [ChainId.COSTON]: useSwapCallback,
  [ChainId.SONGBIRD]: useSwapCallback,
  [ChainId.FLARE_MAINNET]: useSwapCallback,
  [ChainId.HEDERA_TESTNET]: useHederaSwapCallback,
  [ChainId.HEDERA_MAINNET]: useHederaSwapCallback,
  [ChainId.NEAR_MAINNET]: useNearSwapCallback,
  [ChainId.NEAR_TESTNET]: useNearSwapCallback,
  [ChainId.COSTON2]: useSwapCallback,
  [ChainId.EVMOS_TESTNET]: useSwapCallback,
  [ChainId.EVMOS_MAINNET]: useSwapCallback,
  // TODO: Remove following lines
  [ChainId.ETHEREUM]: useSwapCallback,
  [ChainId.POLYGON]: useSwapCallback,
  [ChainId.FANTOM]: useSwapCallback,
  [ChainId.XDAI]: useSwapCallback,
  [ChainId.BSC]: useSwapCallback,
  [ChainId.ARBITRUM]: useSwapCallback,
  [ChainId.CELO]: useSwapCallback,
  [ChainId.OKXCHAIN]: useSwapCallback,
  [ChainId.VELAS]: useSwapCallback,
  [ChainId.AURORA]: useSwapCallback,
  [ChainId.CRONOS]: useSwapCallback,
  [ChainId.FUSE]: useSwapCallback,
  [ChainId.MOONRIVER]: useSwapCallback,
  [ChainId.MOONBEAM]: useSwapCallback,
  [ChainId.OP]: useSwapCallback,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useSwapCallback,
};
