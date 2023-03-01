import { ChainId } from '@pangolindex/sdk';
import {
  useDummyDerivativeSarClaim,
  useDummyDerivativeSarCompound,
  useDummyDerivativeSarStake,
  useDummyDerivativeSarUnstake,
  useDummySarPositions,
} from './dummyHooks';
import {
  useDerivativeHederaSarClaim,
  useDerivativeHederaSarCompound,
  useDerivativeHederaSarStake,
  useDerivativeHederaSarUnstake,
  useHederaSarPositions,
} from './hederaHooks';
import {
  useDerivativeSarClaim,
  useDerivativeSarCompound,
  useDerivativeSarStake,
  useDerivativeSarUnstake,
  useSarPositions,
} from './hooks';

export type useSarPositionsType = {
  [chainId in ChainId]: typeof useSarPositions | typeof useHederaSarPositions | typeof useDummySarPositions;
};

export type useDerivativeSarStakeType = {
  [chainId in ChainId]:
    | typeof useDerivativeSarStake
    | typeof useDerivativeHederaSarStake
    | typeof useDummyDerivativeSarStake;
};

export type useDerivativeSarUnstakeType = {
  [chainId in ChainId]:
    | typeof useDerivativeSarUnstake
    | typeof useDerivativeHederaSarUnstake
    | typeof useDummyDerivativeSarUnstake;
};

export type useDerivativeSarClaimType = {
  [chainId in ChainId]:
    | typeof useDerivativeSarClaim
    | typeof useDerivativeHederaSarClaim
    | typeof useDummyDerivativeSarClaim;
};

export type useDerivativeSarCompoundType = {
  [chainId in ChainId]:
    | typeof useDerivativeSarCompound
    | typeof useDerivativeHederaSarCompound
    | typeof useDummyDerivativeSarCompound;
};

export const useSarPositionsHook: useSarPositionsType = {
  [ChainId.FUJI]: useSarPositions,
  [ChainId.AVALANCHE]: useSarPositions,
  [ChainId.WAGMI]: useSarPositions,
  [ChainId.COSTON]: useSarPositions,
  [ChainId.SONGBIRD]: useSarPositions,
  [ChainId.FLARE_MAINNET]: useSarPositions,
  [ChainId.HEDERA_TESTNET]: useHederaSarPositions,
  [ChainId.HEDERA_MAINNET]: useHederaSarPositions,
  [ChainId.NEAR_MAINNET]: useDummySarPositions,
  [ChainId.NEAR_TESTNET]: useDummySarPositions,
  [ChainId.COSTON2]: useSarPositions,
  [ChainId.EVMOS_TESTNET]: useSarPositions,
  [ChainId.EVMOS_MAINNET]: useDummySarPositions,
  [ChainId.ZKSYNC_TESTNET]: useSarPositions,
  [ChainId.ETHEREUM]: useDummySarPositions,
  [ChainId.POLYGON]: useDummySarPositions,
  [ChainId.FANTOM]: useDummySarPositions,
  [ChainId.XDAI]: useDummySarPositions,
  [ChainId.BSC]: useDummySarPositions,
  [ChainId.ARBITRUM]: useDummySarPositions,
  [ChainId.CELO]: useDummySarPositions,
  [ChainId.OKXCHAIN]: useDummySarPositions,
  [ChainId.VELAS]: useDummySarPositions,
  [ChainId.AURORA]: useDummySarPositions,
  [ChainId.CRONOS]: useDummySarPositions,
  [ChainId.FUSE]: useDummySarPositions,
  [ChainId.MOONRIVER]: useDummySarPositions,
  [ChainId.MOONBEAM]: useDummySarPositions,
  [ChainId.OP]: useDummySarPositions,
};

export const useDerivativeSarStakeHook: useDerivativeSarStakeType = {
  [ChainId.FUJI]: useDerivativeSarStake,
  [ChainId.AVALANCHE]: useDerivativeSarStake,
  [ChainId.WAGMI]: useDerivativeSarStake,
  [ChainId.COSTON]: useDerivativeSarStake,
  [ChainId.SONGBIRD]: useDerivativeSarStake,
  [ChainId.FLARE_MAINNET]: useDerivativeSarStake,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarStake,
  [ChainId.HEDERA_MAINNET]: useDerivativeHederaSarStake,
  [ChainId.NEAR_MAINNET]: useDummyDerivativeSarStake,
  [ChainId.NEAR_TESTNET]: useDummyDerivativeSarStake,
  [ChainId.COSTON2]: useDerivativeSarStake,
  [ChainId.EVMOS_TESTNET]: useDerivativeSarStake,
  [ChainId.EVMOS_MAINNET]: useDummyDerivativeSarStake,
  [ChainId.ZKSYNC_TESTNET]: useDerivativeSarStake,
  [ChainId.ETHEREUM]: useDummyDerivativeSarStake,
  [ChainId.POLYGON]: useDummyDerivativeSarStake,
  [ChainId.FANTOM]: useDummyDerivativeSarStake,
  [ChainId.XDAI]: useDummyDerivativeSarStake,
  [ChainId.BSC]: useDummyDerivativeSarStake,
  [ChainId.ARBITRUM]: useDummyDerivativeSarStake,
  [ChainId.CELO]: useDummyDerivativeSarStake,
  [ChainId.OKXCHAIN]: useDummyDerivativeSarStake,
  [ChainId.VELAS]: useDummyDerivativeSarStake,
  [ChainId.AURORA]: useDummyDerivativeSarStake,
  [ChainId.CRONOS]: useDummyDerivativeSarStake,
  [ChainId.FUSE]: useDummyDerivativeSarStake,
  [ChainId.MOONRIVER]: useDummyDerivativeSarStake,
  [ChainId.MOONBEAM]: useDummyDerivativeSarStake,
  [ChainId.OP]: useDummyDerivativeSarStake,
};

export const useDerivativeSarUnstakeHook: useDerivativeSarUnstakeType = {
  [ChainId.FUJI]: useDerivativeSarUnstake,
  [ChainId.AVALANCHE]: useDerivativeSarUnstake,
  [ChainId.WAGMI]: useDerivativeSarUnstake,
  [ChainId.COSTON]: useDerivativeSarUnstake,
  [ChainId.SONGBIRD]: useDerivativeSarUnstake,
  [ChainId.FLARE_MAINNET]: useDerivativeSarUnstake,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarUnstake,
  [ChainId.HEDERA_MAINNET]: useDerivativeHederaSarUnstake,
  [ChainId.NEAR_MAINNET]: useDummyDerivativeSarUnstake,
  [ChainId.NEAR_TESTNET]: useDummyDerivativeSarUnstake,
  [ChainId.COSTON2]: useDerivativeSarUnstake,
  [ChainId.EVMOS_TESTNET]: useDerivativeSarUnstake,
  [ChainId.EVMOS_MAINNET]: useDummyDerivativeSarUnstake,
  [ChainId.ZKSYNC_TESTNET]: useDerivativeSarUnstake,
  [ChainId.ETHEREUM]: useDummyDerivativeSarUnstake,
  [ChainId.POLYGON]: useDummyDerivativeSarUnstake,
  [ChainId.FANTOM]: useDummyDerivativeSarUnstake,
  [ChainId.XDAI]: useDummyDerivativeSarUnstake,
  [ChainId.BSC]: useDummyDerivativeSarUnstake,
  [ChainId.ARBITRUM]: useDummyDerivativeSarUnstake,
  [ChainId.CELO]: useDummyDerivativeSarUnstake,
  [ChainId.OKXCHAIN]: useDummyDerivativeSarUnstake,
  [ChainId.VELAS]: useDummyDerivativeSarUnstake,
  [ChainId.AURORA]: useDummyDerivativeSarUnstake,
  [ChainId.CRONOS]: useDummyDerivativeSarUnstake,
  [ChainId.FUSE]: useDummyDerivativeSarUnstake,
  [ChainId.MOONRIVER]: useDummyDerivativeSarUnstake,
  [ChainId.MOONBEAM]: useDummyDerivativeSarUnstake,
  [ChainId.OP]: useDummyDerivativeSarUnstake,
};

export const useDerivativeSarClaimHook: useDerivativeSarClaimType = {
  [ChainId.FUJI]: useDerivativeSarClaim,
  [ChainId.AVALANCHE]: useDerivativeSarClaim,
  [ChainId.WAGMI]: useDerivativeSarClaim,
  [ChainId.COSTON]: useDerivativeSarClaim,
  [ChainId.SONGBIRD]: useDerivativeSarClaim,
  [ChainId.FLARE_MAINNET]: useDerivativeSarClaim,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarClaim,
  [ChainId.HEDERA_MAINNET]: useDerivativeHederaSarClaim,
  [ChainId.NEAR_MAINNET]: useDummyDerivativeSarClaim,
  [ChainId.NEAR_TESTNET]: useDummyDerivativeSarClaim,
  [ChainId.COSTON2]: useDerivativeSarClaim,
  [ChainId.EVMOS_TESTNET]: useDerivativeSarClaim,
  [ChainId.EVMOS_MAINNET]: useDummyDerivativeSarClaim,
  [ChainId.ZKSYNC_TESTNET]: useDerivativeSarClaim,
  [ChainId.ETHEREUM]: useDummyDerivativeSarClaim,
  [ChainId.POLYGON]: useDummyDerivativeSarClaim,
  [ChainId.FANTOM]: useDummyDerivativeSarClaim,
  [ChainId.XDAI]: useDummyDerivativeSarClaim,
  [ChainId.BSC]: useDummyDerivativeSarClaim,
  [ChainId.ARBITRUM]: useDummyDerivativeSarClaim,
  [ChainId.CELO]: useDummyDerivativeSarClaim,
  [ChainId.OKXCHAIN]: useDummyDerivativeSarClaim,
  [ChainId.VELAS]: useDummyDerivativeSarClaim,
  [ChainId.AURORA]: useDummyDerivativeSarClaim,
  [ChainId.CRONOS]: useDummyDerivativeSarClaim,
  [ChainId.FUSE]: useDummyDerivativeSarClaim,
  [ChainId.MOONRIVER]: useDummyDerivativeSarClaim,
  [ChainId.MOONBEAM]: useDummyDerivativeSarClaim,
  [ChainId.OP]: useDummyDerivativeSarClaim,
};

export const useDerivativeSarCompoundHook: useDerivativeSarCompoundType = {
  [ChainId.FUJI]: useDerivativeSarCompound,
  [ChainId.AVALANCHE]: useDerivativeSarCompound,
  [ChainId.WAGMI]: useDerivativeSarCompound,
  [ChainId.COSTON]: useDerivativeSarCompound,
  [ChainId.SONGBIRD]: useDerivativeSarCompound,
  [ChainId.FLARE_MAINNET]: useDerivativeSarCompound,
  [ChainId.HEDERA_TESTNET]: useDerivativeHederaSarCompound,
  [ChainId.HEDERA_MAINNET]: useDerivativeHederaSarCompound,
  [ChainId.NEAR_MAINNET]: useDummyDerivativeSarCompound,
  [ChainId.NEAR_TESTNET]: useDummyDerivativeSarCompound,
  [ChainId.COSTON2]: useDerivativeSarCompound,
  [ChainId.EVMOS_TESTNET]: useDerivativeSarCompound,
  [ChainId.EVMOS_MAINNET]: useDummyDerivativeSarCompound,
  [ChainId.ZKSYNC_TESTNET]: useDerivativeSarCompound,
  [ChainId.ETHEREUM]: useDummyDerivativeSarCompound,
  [ChainId.POLYGON]: useDummyDerivativeSarCompound,
  [ChainId.FANTOM]: useDummyDerivativeSarCompound,
  [ChainId.XDAI]: useDummyDerivativeSarCompound,
  [ChainId.BSC]: useDummyDerivativeSarCompound,
  [ChainId.ARBITRUM]: useDummyDerivativeSarCompound,
  [ChainId.CELO]: useDummyDerivativeSarCompound,
  [ChainId.OKXCHAIN]: useDummyDerivativeSarCompound,
  [ChainId.VELAS]: useDummyDerivativeSarCompound,
  [ChainId.AURORA]: useDummyDerivativeSarCompound,
  [ChainId.CRONOS]: useDummyDerivativeSarCompound,
  [ChainId.FUSE]: useDummyDerivativeSarCompound,
  [ChainId.MOONRIVER]: useDummyDerivativeSarCompound,
  [ChainId.MOONBEAM]: useDummyDerivativeSarCompound,
  [ChainId.OP]: useDummyDerivativeSarCompound,
};
