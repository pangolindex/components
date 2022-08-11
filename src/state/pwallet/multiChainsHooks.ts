import { ChainId } from '@pangolindex/sdk';
import {
  useAddLiquidity,
  useETHBalances,
  useGetNearUserLP,
  useGetUserLP,
  useNearAddLiquidity,
  useNearBalance,
  useNearRemoveLiquidity,
  useNearTokenBalance,
  useNearTokenBalances,
  useRemoveLiquidity,
  useTokenBalance,
  useTokenBalances,
} from './hooks';

export const useTokenBalancesHook = {
  [ChainId.FUJI]: useTokenBalances,
  [ChainId.AVALANCHE]: useTokenBalances,
  [ChainId.WAGMI]: useTokenBalances,
  [ChainId.COSTON]: useTokenBalances,
  [ChainId.NEAR_MAINNET]: useNearTokenBalances,
  [ChainId.NEAR_TESTNET]: useNearTokenBalances,
};

export const useTokenBalanceHook = {
  [ChainId.FUJI]: useTokenBalance,
  [ChainId.AVALANCHE]: useTokenBalance,
  [ChainId.WAGMI]: useTokenBalance,
  [ChainId.COSTON]: useTokenBalance,
  [ChainId.NEAR_MAINNET]: useNearTokenBalance,
  [ChainId.NEAR_TESTNET]: useNearTokenBalance,
};

export const useAccountBalanceHook = {
  [ChainId.FUJI]: useETHBalances,
  [ChainId.AVALANCHE]: useETHBalances,
  [ChainId.WAGMI]: useETHBalances,
  [ChainId.COSTON]: useETHBalances,
  [ChainId.NEAR_MAINNET]: useNearBalance,
  [ChainId.NEAR_TESTNET]: useNearBalance,
};

export const useAddLiquidityHook = {
  [ChainId.FUJI]: useAddLiquidity,
  [ChainId.AVALANCHE]: useAddLiquidity,
  [ChainId.WAGMI]: useAddLiquidity,
  [ChainId.COSTON]: useAddLiquidity,
  [ChainId.NEAR_MAINNET]: useNearAddLiquidity,
  [ChainId.NEAR_TESTNET]: useNearAddLiquidity,
};

export const useRemoveLiquidityHook = {
  [ChainId.FUJI]: useRemoveLiquidity,
  [ChainId.AVALANCHE]: useRemoveLiquidity,
  [ChainId.WAGMI]: useRemoveLiquidity,
  [ChainId.COSTON]: useRemoveLiquidity,
  [ChainId.NEAR_MAINNET]: useNearRemoveLiquidity,
  [ChainId.NEAR_TESTNET]: useNearRemoveLiquidity,
};

export const useGetNearUserLPHook = {
  [ChainId.FUJI]: useGetUserLP,
  [ChainId.AVALANCHE]: useGetUserLP,
  [ChainId.WAGMI]: useGetUserLP,
  [ChainId.COSTON]: useGetUserLP,
  [ChainId.NEAR_MAINNET]: useGetNearUserLP,
  [ChainId.NEAR_TESTNET]: useGetNearUserLP,
};
