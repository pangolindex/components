import { ChainId } from '@pangolindex/sdk';
import {
  useAddLiquidity,
  useDummyCreatePair,
  useDummyGetUserLP,
  useETHBalances,
  useGetNearUserLP,
  useGetUserLP,
  useHederaAddLiquidity,
  useHederaBalance,
  useHederaCreatePair,
  useNearAddLiquidity,
  useNearBalance,
  useNearCreatePair,
  useNearRemoveLiquidity,
  useNearTokenBalance,
  useNearTokenBalances,
  useRemoveLiquidity,
  useTokenBalance,
  useTokenBalances,
} from './hooks';

export type UseTokenBalancesHookType = {
  [chainId in ChainId]: typeof useTokenBalances | typeof useNearTokenBalances;
};

export const useTokenBalancesHook: UseTokenBalancesHookType = {
  [ChainId.FUJI]: useTokenBalances,
  [ChainId.AVALANCHE]: useTokenBalances,
  [ChainId.WAGMI]: useTokenBalances,
  [ChainId.COSTON]: useTokenBalances,
  [ChainId.SONGBIRD]: useTokenBalances,
  [ChainId.HEDERA_TESTNET]: useTokenBalances,
  [ChainId.NEAR_MAINNET]: useNearTokenBalances,
  [ChainId.NEAR_TESTNET]: useNearTokenBalances,
};

export type UseTokenBalanceHookType = {
  [chainId in ChainId]: typeof useTokenBalance | typeof useNearTokenBalance;
};

export const useTokenBalanceHook: UseTokenBalanceHookType = {
  [ChainId.FUJI]: useTokenBalance,
  [ChainId.AVALANCHE]: useTokenBalance,
  [ChainId.WAGMI]: useTokenBalance,
  [ChainId.COSTON]: useTokenBalance,
  [ChainId.SONGBIRD]: useTokenBalance,
  [ChainId.HEDERA_TESTNET]: useTokenBalance,
  [ChainId.NEAR_MAINNET]: useNearTokenBalance,
  [ChainId.NEAR_TESTNET]: useNearTokenBalance,
};

export type UseAccountBalanceHookType = {
  [chainId in ChainId]: typeof useETHBalances | typeof useNearBalance | typeof useHederaBalance;
};

export const useAccountBalanceHook: UseAccountBalanceHookType = {
  [ChainId.FUJI]: useETHBalances,
  [ChainId.AVALANCHE]: useETHBalances,
  [ChainId.WAGMI]: useETHBalances,
  [ChainId.COSTON]: useETHBalances,
  [ChainId.SONGBIRD]: useETHBalances,
  [ChainId.HEDERA_TESTNET]: useHederaBalance,
  [ChainId.NEAR_MAINNET]: useNearBalance,
  [ChainId.NEAR_TESTNET]: useNearBalance,
};

export type UseAddLiquidityHookType = {
  [chainId in ChainId]: typeof useAddLiquidity | typeof useNearAddLiquidity | typeof useHederaAddLiquidity;
};

export const useAddLiquidityHook: UseAddLiquidityHookType = {
  [ChainId.FUJI]: useAddLiquidity,
  [ChainId.AVALANCHE]: useAddLiquidity,
  [ChainId.WAGMI]: useAddLiquidity,
  [ChainId.COSTON]: useAddLiquidity,
  [ChainId.SONGBIRD]: useAddLiquidity,
  [ChainId.HEDERA_TESTNET]: useHederaAddLiquidity,
  [ChainId.NEAR_MAINNET]: useNearAddLiquidity,
  [ChainId.NEAR_TESTNET]: useNearAddLiquidity,
};

export type UseRemoveLiquidityHookType = {
  [chainId in ChainId]: typeof useRemoveLiquidity | typeof useNearRemoveLiquidity;
};

export const useRemoveLiquidityHook: UseRemoveLiquidityHookType = {
  [ChainId.FUJI]: useRemoveLiquidity,
  [ChainId.AVALANCHE]: useRemoveLiquidity,
  [ChainId.WAGMI]: useRemoveLiquidity,
  [ChainId.COSTON]: useRemoveLiquidity,
  [ChainId.SONGBIRD]: useRemoveLiquidity,
  [ChainId.HEDERA_TESTNET]: useRemoveLiquidity,
  [ChainId.NEAR_MAINNET]: useNearRemoveLiquidity,
  [ChainId.NEAR_TESTNET]: useNearRemoveLiquidity,
};

export type UseGetUserLPHookType = {
  [chainId in ChainId]: typeof useGetUserLP | typeof useGetNearUserLP | typeof useDummyGetUserLP;
};

export const useGetUserLPHook: UseGetUserLPHookType = {
  [ChainId.FUJI]: useGetUserLP,
  [ChainId.AVALANCHE]: useGetUserLP,
  [ChainId.WAGMI]: useGetUserLP,
  [ChainId.COSTON]: useGetUserLP,
  [ChainId.SONGBIRD]: useGetUserLP,
  [ChainId.HEDERA_TESTNET]: useDummyGetUserLP,
  [ChainId.NEAR_MAINNET]: useGetNearUserLP,
  [ChainId.NEAR_TESTNET]: useGetNearUserLP,
};

export type UseCreatePairHookType = {
  [chainId in ChainId]: typeof useDummyCreatePair | typeof useNearCreatePair | typeof useHederaCreatePair;
};

/**
 * Create Pair related hooks
 * Basically takes 2 tokens to create a pair
 */
export const useCreatePairHook: UseCreatePairHookType = {
  [ChainId.FUJI]: useDummyCreatePair,
  [ChainId.AVALANCHE]: useDummyCreatePair,
  [ChainId.WAGMI]: useDummyCreatePair,
  [ChainId.COSTON]: useDummyCreatePair,
  [ChainId.SONGBIRD]: useDummyCreatePair,
  [ChainId.HEDERA_TESTNET]: useHederaCreatePair,
  [ChainId.NEAR_MAINNET]: useNearCreatePair,
  [ChainId.NEAR_TESTNET]: useNearCreatePair,
};
