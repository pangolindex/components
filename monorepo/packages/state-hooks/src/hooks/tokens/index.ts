import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import { useToken, useTokensContract } from './evm';
import { useNearToken, useNearTokens } from './near';
import { useTokens, useTokensViaSubGraph } from './subgraph';
import { useGetAllHederaAssociatedTokens } from './hedera';

export type UseTokenHookType = {
  [chainId in ChainId]: typeof useToken | typeof useNearToken | typeof useDummyHook;
};

export const useTokenHook: UseTokenHookType = {
  [ChainId.FUJI]: useToken,
  [ChainId.AVALANCHE]: useToken,
  [ChainId.WAGMI]: useToken,
  [ChainId.COSTON]: useToken,
  [ChainId.SONGBIRD]: useToken,
  [ChainId.FLARE_MAINNET]: useToken,
  [ChainId.HEDERA_TESTNET]: useToken,
  [ChainId.HEDERA_MAINNET]: useToken,
  [ChainId.NEAR_MAINNET]: useNearToken,
  [ChainId.NEAR_TESTNET]: useNearToken,
  [ChainId.COSTON2]: useToken,
  [ChainId.EVMOS_TESTNET]: useToken,
  [ChainId.EVMOS_MAINNET]: useToken,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useToken,
};

export type UseTokensHookType = {
  [chainId in ChainId]:
    | typeof useTokensContract
    | typeof useNearTokens
    | typeof useTokensViaSubGraph
    | typeof useDummyHook
    | typeof useTokens;
};

export const useTokensHook: UseTokensHookType = {
  [ChainId.FUJI]: useTokensContract,
  [ChainId.AVALANCHE]: useTokensContract,
  [ChainId.WAGMI]: useTokensContract,
  [ChainId.COSTON]: useTokensContract,
  [ChainId.SONGBIRD]: useTokensContract,
  [ChainId.FLARE_MAINNET]: useTokensContract,
  [ChainId.HEDERA_TESTNET]: useTokens,
  [ChainId.HEDERA_MAINNET]: useTokens,
  [ChainId.NEAR_MAINNET]: useNearTokens,
  [ChainId.NEAR_TESTNET]: useNearTokens,
  [ChainId.COSTON2]: useTokensContract,
  [ChainId.EVMOS_TESTNET]: useTokensContract,
  [ChainId.EVMOS_MAINNET]: useTokensContract,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useTokensContract,
};

export { useToken, useTokensContract, useNearToken, useNearTokens, useTokens, useTokensViaSubGraph , useGetAllHederaAssociatedTokens};
