import { ChainId } from '@pangolindex/sdk';
import {
  useAddLiquidity,
  useDummyCreatePair,
  useDummyGetUserLP,
  useETHBalances,
  useEVMPairBalance,
  useGetHederaUserLP,
  useGetNearUserLP,
  useGetUserLP,
  useHederaAddLiquidity,
  useHederaBalance,
  useHederaCreatePair,
  useHederaPairBalance,
  useHederaRemoveLiquidity,
  useNearAddLiquidity,
  useNearBalance,
  useNearCreatePair,
  useNearPairBalance,
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
  [ChainId.EVMOS_TESTNET]: useTokenBalances,
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
  [ChainId.EVMOS_TESTNET]: useTokenBalance,
};

export type UsePairBalanceHookType = {
  [chainId in ChainId]: typeof useEVMPairBalance | typeof useHederaPairBalance | typeof useNearPairBalance;
};

export const usePairBalanceHook: UsePairBalanceHookType = {
  [ChainId.FUJI]: useEVMPairBalance,
  [ChainId.AVALANCHE]: useEVMPairBalance,
  [ChainId.WAGMI]: useEVMPairBalance,
  [ChainId.COSTON]: useEVMPairBalance,
  [ChainId.SONGBIRD]: useEVMPairBalance,
  [ChainId.HEDERA_TESTNET]: useHederaPairBalance,
  [ChainId.NEAR_MAINNET]: useNearPairBalance,
  [ChainId.NEAR_TESTNET]: useNearPairBalance,
  [ChainId.EVMOS_TESTNET]: useEVMPairBalance,
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
  [ChainId.EVMOS_TESTNET]: useETHBalances,
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
  [ChainId.EVMOS_TESTNET]: useAddLiquidity,
};

export type UseRemoveLiquidityHookType = {
  [chainId in ChainId]: typeof useRemoveLiquidity | typeof useNearRemoveLiquidity | typeof useHederaRemoveLiquidity;
};

export const useRemoveLiquidityHook: UseRemoveLiquidityHookType = {
  [ChainId.FUJI]: useRemoveLiquidity,
  [ChainId.AVALANCHE]: useRemoveLiquidity,
  [ChainId.WAGMI]: useRemoveLiquidity,
  [ChainId.COSTON]: useRemoveLiquidity,
  [ChainId.SONGBIRD]: useRemoveLiquidity,
  [ChainId.HEDERA_TESTNET]: useHederaRemoveLiquidity,
  [ChainId.NEAR_MAINNET]: useNearRemoveLiquidity,
  [ChainId.NEAR_TESTNET]: useNearRemoveLiquidity,
  [ChainId.EVMOS_TESTNET]: useRemoveLiquidity,
};

export type UseGetUserLPHookType = {
  [chainId in ChainId]:
    | typeof useGetUserLP
    | typeof useGetNearUserLP
    | typeof useDummyGetUserLP
    | typeof useGetHederaUserLP;
};

export const useGetUserLPHook: UseGetUserLPHookType = {
  [ChainId.FUJI]: useGetUserLP,
  [ChainId.AVALANCHE]: useGetUserLP,
  [ChainId.WAGMI]: useGetUserLP,
  [ChainId.COSTON]: useGetUserLP,
  [ChainId.SONGBIRD]: useGetUserLP,
  [ChainId.HEDERA_TESTNET]: useGetHederaUserLP,
  [ChainId.NEAR_MAINNET]: useGetNearUserLP,
  [ChainId.NEAR_TESTNET]: useGetNearUserLP,
  [ChainId.EVMOS_TESTNET]: useGetUserLP,
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
  [ChainId.EVMOS_TESTNET]: useDummyCreatePair,
};
