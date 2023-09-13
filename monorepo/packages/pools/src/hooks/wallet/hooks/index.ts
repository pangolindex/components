/* eslint-disable max-lines */
import { useDummyHook } from '@honeycomb-finance/shared';
import { ChainId } from '@pangolindex/sdk';
import { useDummyCreatePair, useDummyGetUserLP } from './dummy';
import { useAddLiquidity, useEVMPairBalance, useGetUserLP, useRemoveLiquidity } from './evm';
import {
  useGetHederaUserLP,
  useHederaAddLiquidity,
  useHederaCreatePair,
  useHederaPairBalance,
  useHederaRemoveLiquidity,
} from './hedera';
import {
  useGetNearUserLP,
  useNearAddLiquidity,
  useNearCreatePair,
  useNearPairBalance,
  useNearRemoveLiquidity,
} from './near';

export type UsePairBalanceHookType = {
  [chainId in ChainId]: typeof useEVMPairBalance | typeof useHederaPairBalance | typeof useNearPairBalance;
};

export const usePairBalanceHook: UsePairBalanceHookType = {
  [ChainId.FUJI]: useEVMPairBalance,
  [ChainId.AVALANCHE]: useEVMPairBalance,
  [ChainId.WAGMI]: useEVMPairBalance,
  [ChainId.COSTON]: useEVMPairBalance,
  [ChainId.SONGBIRD]: useEVMPairBalance,
  [ChainId.FLARE_MAINNET]: useEVMPairBalance,
  [ChainId.HEDERA_TESTNET]: useHederaPairBalance,
  [ChainId.HEDERA_MAINNET]: useHederaPairBalance,
  [ChainId.NEAR_MAINNET]: useNearPairBalance,
  [ChainId.NEAR_TESTNET]: useNearPairBalance,
  [ChainId.COSTON2]: useEVMPairBalance,
  [ChainId.EVMOS_TESTNET]: useEVMPairBalance,
  [ChainId.EVMOS_MAINNET]: useEVMPairBalance,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useEVMPairBalance,
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
  [ChainId.FLARE_MAINNET]: useAddLiquidity,
  [ChainId.HEDERA_TESTNET]: useHederaAddLiquidity,
  [ChainId.HEDERA_MAINNET]: useHederaAddLiquidity,
  [ChainId.NEAR_MAINNET]: useNearAddLiquidity,
  [ChainId.NEAR_TESTNET]: useNearAddLiquidity,
  [ChainId.COSTON2]: useAddLiquidity,
  [ChainId.EVMOS_TESTNET]: useAddLiquidity,
  [ChainId.EVMOS_MAINNET]: useAddLiquidity,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useAddLiquidity,
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
  [ChainId.FLARE_MAINNET]: useRemoveLiquidity,
  [ChainId.HEDERA_TESTNET]: useHederaRemoveLiquidity,
  [ChainId.HEDERA_MAINNET]: useHederaRemoveLiquidity,
  [ChainId.NEAR_MAINNET]: useNearRemoveLiquidity,
  [ChainId.NEAR_TESTNET]: useNearRemoveLiquidity,
  [ChainId.COSTON2]: useRemoveLiquidity,
  [ChainId.EVMOS_TESTNET]: useRemoveLiquidity,
  [ChainId.EVMOS_MAINNET]: useRemoveLiquidity,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useRemoveLiquidity,
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
  [ChainId.FLARE_MAINNET]: useGetUserLP,
  [ChainId.HEDERA_TESTNET]: useGetHederaUserLP,
  [ChainId.HEDERA_MAINNET]: useGetHederaUserLP,
  [ChainId.NEAR_MAINNET]: useGetNearUserLP,
  [ChainId.NEAR_TESTNET]: useGetNearUserLP,
  [ChainId.COSTON2]: useGetUserLP,
  [ChainId.EVMOS_TESTNET]: useGetUserLP,
  [ChainId.EVMOS_MAINNET]: useGetUserLP,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useGetUserLP,
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
  [ChainId.FLARE_MAINNET]: useDummyCreatePair,
  [ChainId.HEDERA_TESTNET]: useHederaCreatePair,
  [ChainId.HEDERA_MAINNET]: useHederaCreatePair,
  [ChainId.NEAR_MAINNET]: useNearCreatePair,
  [ChainId.NEAR_TESTNET]: useNearCreatePair,
  [ChainId.COSTON2]: useDummyCreatePair,
  [ChainId.EVMOS_TESTNET]: useDummyCreatePair,
  [ChainId.EVMOS_MAINNET]: useDummyCreatePair,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyCreatePair,
};
