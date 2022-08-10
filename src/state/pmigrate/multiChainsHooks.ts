import { ChainId } from '@pangolindex/sdk';
import { useGetNearUserLP, useGetUserLP } from './hooks';

export const useGetNearUserLPHook = {
  [ChainId.FUJI]: useGetUserLP,
  [ChainId.AVALANCHE]: useGetUserLP,
  [ChainId.WAGMI]: useGetUserLP,
  [ChainId.COSTON]: useGetUserLP,
  [ChainId.NEAR_MAINNET]: useGetNearUserLP,
  [ChainId.NEAR_TESTNET]: useGetNearUserLP,
};
