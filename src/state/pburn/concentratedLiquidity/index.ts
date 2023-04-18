import { ChainId } from '@pangolindex/sdk';
import { useConcentratedRemoveLiquidity } from './evm';

export type useConcentratedRemoveLiquidityHookType = {
  [chainId in ChainId]: typeof useConcentratedRemoveLiquidity;
};

export const useConcentratedRemoveLiquidityHook: useConcentratedRemoveLiquidityHookType = {
  [ChainId.FUJI]: useConcentratedRemoveLiquidity,
  [ChainId.AVALANCHE]: useConcentratedRemoveLiquidity,
  [ChainId.WAGMI]: useConcentratedRemoveLiquidity,
  [ChainId.COSTON]: useConcentratedRemoveLiquidity,
  [ChainId.SONGBIRD]: useConcentratedRemoveLiquidity,
  [ChainId.FLARE_MAINNET]: useConcentratedRemoveLiquidity,
  [ChainId.HEDERA_TESTNET]: useConcentratedRemoveLiquidity,
  [ChainId.HEDERA_MAINNET]: useConcentratedRemoveLiquidity,
  [ChainId.NEAR_MAINNET]: useConcentratedRemoveLiquidity,
  [ChainId.NEAR_TESTNET]: useConcentratedRemoveLiquidity,
  [ChainId.COSTON2]: useConcentratedRemoveLiquidity,
  [ChainId.EVMOS_TESTNET]: useConcentratedRemoveLiquidity,
  [ChainId.EVMOS_MAINNET]: useConcentratedRemoveLiquidity,
  [ChainId.ETHEREUM]: useConcentratedRemoveLiquidity,
  [ChainId.POLYGON]: useConcentratedRemoveLiquidity,
  [ChainId.FANTOM]: useConcentratedRemoveLiquidity,
  [ChainId.XDAI]: useConcentratedRemoveLiquidity,
  [ChainId.BSC]: useConcentratedRemoveLiquidity,
  [ChainId.ARBITRUM]: useConcentratedRemoveLiquidity,
  [ChainId.CELO]: useConcentratedRemoveLiquidity,
  [ChainId.OKXCHAIN]: useConcentratedRemoveLiquidity,
  [ChainId.VELAS]: useConcentratedRemoveLiquidity,
  [ChainId.AURORA]: useConcentratedRemoveLiquidity,
  [ChainId.CRONOS]: useConcentratedRemoveLiquidity,
  [ChainId.FUSE]: useConcentratedRemoveLiquidity,
  [ChainId.MOONRIVER]: useConcentratedRemoveLiquidity,
  [ChainId.MOONBEAM]: useConcentratedRemoveLiquidity,
  [ChainId.OP]: useConcentratedRemoveLiquidity,
};
