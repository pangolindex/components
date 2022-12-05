import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
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
  // TODO: We need to check following chains
  [ChainId.ETHEREUM]: useTokenBalances,
  [ChainId.POLYGON]: useTokenBalances,
  [ChainId.FANTOM]: useTokenBalances,
  [ChainId.XDAI]: useTokenBalances,
  [ChainId.BSC]: useTokenBalances,
  [ChainId.ARBITRUM]: useTokenBalances,
  [ChainId.CELO]: useTokenBalances,
  [ChainId.OKXCHAIN]: useTokenBalances,
  [ChainId.VELAS]: useTokenBalances,
  [ChainId.AURORA]: useTokenBalances,
  [ChainId.CRONOS]: useTokenBalances,
  [ChainId.FUSE]: useTokenBalances,
  [ChainId.MOONRIVER]: useTokenBalances,
  [ChainId.MOONBEAM]: useTokenBalances,
  [ChainId.OP]: useTokenBalances,
};

export type UseTokenBalanceHookType = {
  [chainId in ChainId]: typeof useTokenBalance | typeof useNearTokenBalance | typeof useDummyHook;
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
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useEVMPairBalance,
  [ChainId.POLYGON]: useEVMPairBalance,
  [ChainId.FANTOM]: useEVMPairBalance,
  [ChainId.XDAI]: useEVMPairBalance,
  [ChainId.BSC]: useEVMPairBalance,
  [ChainId.ARBITRUM]: useEVMPairBalance,
  [ChainId.CELO]: useEVMPairBalance,
  [ChainId.OKXCHAIN]: useEVMPairBalance,
  [ChainId.VELAS]: useEVMPairBalance,
  [ChainId.AURORA]: useEVMPairBalance,
  [ChainId.CRONOS]: useEVMPairBalance,
  [ChainId.FUSE]: useEVMPairBalance,
  [ChainId.MOONRIVER]: useEVMPairBalance,
  [ChainId.MOONBEAM]: useEVMPairBalance,
  [ChainId.OP]: useEVMPairBalance,
};

export type UseAccountBalanceHookType = {
  [chainId in ChainId]: typeof useETHBalances | typeof useNearBalance | typeof useHederaBalance | typeof useDummyHook;
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
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useAddLiquidity,
  [ChainId.POLYGON]: useAddLiquidity,
  [ChainId.FANTOM]: useAddLiquidity,
  [ChainId.XDAI]: useAddLiquidity,
  [ChainId.BSC]: useAddLiquidity,
  [ChainId.ARBITRUM]: useAddLiquidity,
  [ChainId.CELO]: useAddLiquidity,
  [ChainId.OKXCHAIN]: useAddLiquidity,
  [ChainId.VELAS]: useAddLiquidity,
  [ChainId.AURORA]: useAddLiquidity,
  [ChainId.CRONOS]: useAddLiquidity,
  [ChainId.FUSE]: useAddLiquidity,
  [ChainId.MOONRIVER]: useAddLiquidity,
  [ChainId.MOONBEAM]: useAddLiquidity,
  [ChainId.OP]: useAddLiquidity,
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
  // TODO: Remove these hooks later on
  [ChainId.ETHEREUM]: useRemoveLiquidity,
  [ChainId.POLYGON]: useRemoveLiquidity,
  [ChainId.FANTOM]: useRemoveLiquidity,
  [ChainId.XDAI]: useRemoveLiquidity,
  [ChainId.BSC]: useRemoveLiquidity,
  [ChainId.ARBITRUM]: useRemoveLiquidity,
  [ChainId.CELO]: useRemoveLiquidity,
  [ChainId.OKXCHAIN]: useRemoveLiquidity,
  [ChainId.VELAS]: useRemoveLiquidity,
  [ChainId.AURORA]: useRemoveLiquidity,
  [ChainId.CRONOS]: useRemoveLiquidity,
  [ChainId.FUSE]: useRemoveLiquidity,
  [ChainId.MOONRIVER]: useRemoveLiquidity,
  [ChainId.MOONBEAM]: useRemoveLiquidity,
  [ChainId.OP]: useRemoveLiquidity,
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
  // TODO: Remove these hooks later on
  [ChainId.ETHEREUM]: useGetUserLP,
  [ChainId.POLYGON]: useGetUserLP,
  [ChainId.FANTOM]: useGetUserLP,
  [ChainId.XDAI]: useGetUserLP,
  [ChainId.BSC]: useGetUserLP,
  [ChainId.ARBITRUM]: useGetUserLP,
  [ChainId.CELO]: useGetUserLP,
  [ChainId.OKXCHAIN]: useGetUserLP,
  [ChainId.VELAS]: useGetUserLP,
  [ChainId.AURORA]: useGetUserLP,
  [ChainId.CRONOS]: useGetUserLP,
  [ChainId.FUSE]: useGetUserLP,
  [ChainId.MOONRIVER]: useGetUserLP,
  [ChainId.MOONBEAM]: useGetUserLP,
  [ChainId.OP]: useGetUserLP,
};

export type UseCreatePairHookType = {
  [chainId in ChainId]:
    | typeof useDummyCreatePair
    | typeof useNearCreatePair
    | typeof useHederaCreatePair
    | typeof useDummyHook;
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
};
