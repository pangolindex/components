import { ChainId } from '@pangolindex/sdk';
import useDummyHook from '../useDummyHook';
import { useTokenAllowance } from './evm';

export type UseTokenAllowanceHookType = {
  [chainId in ChainId]: typeof useTokenAllowance | typeof useDummyHook;
};

export const useTokenAllowanceHook: UseTokenAllowanceHookType = {
  [ChainId.FUJI]: useTokenAllowance,
  [ChainId.AVALANCHE]: useTokenAllowance,
  [ChainId.WAGMI]: useTokenAllowance,
  [ChainId.COSTON]: useTokenAllowance,
  [ChainId.SONGBIRD]: useTokenAllowance,
  [ChainId.FLARE_MAINNET]: useTokenAllowance,
  [ChainId.HEDERA_TESTNET]: useTokenAllowance,
  [ChainId.HEDERA_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_TESTNET]: useTokenAllowance,
  [ChainId.COSTON2]: useTokenAllowance,
  [ChainId.EVMOS_TESTNET]: useTokenAllowance,
  [ChainId.EVMOS_MAINNET]: useTokenAllowance,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useTokenAllowance,
};
