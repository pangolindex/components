import { ChainId } from '@pangolindex/sdk';
import { useAddLiquidity, useNearAddLiquidity } from './hooks';

export const useAddLiquidityfHook = {
  [ChainId.FUJI]: useAddLiquidity,
  [ChainId.AVALANCHE]: useAddLiquidity,
  [ChainId.WAGMI]: useAddLiquidity,
  [ChainId.COSTON]: useAddLiquidity,
  [ChainId.NEAR_MAINNET]: useNearAddLiquidity,
  [ChainId.NEAR_TESTNET]: useNearAddLiquidity,
};
