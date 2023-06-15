import { ChainId } from '@pangolindex/sdk';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import { useTokenAllowance } from './Allowances';
import { useNearPairs, usePairs, usePairsContract, usePairsViaSubgraph } from './Reserves';
import {
  useEvmPairTotalSupply,
  useHederaPairTotalSupply,
  useHederaTotalSupply,
  useNearPairTotalSupply,
  useNearTotalSupply,
  usePairTotalSupplyViaSubgraph,
  useTotalSupply,
} from './TotalSupply';

export type UsePairsHookType = {
  [chainId in ChainId]: typeof usePairsContract | typeof useNearPairs | typeof usePairsViaSubgraph | typeof usePairs;
};

export const usePairsHook: UsePairsHookType = {
  [ChainId.FUJI]: usePairsContract,
  [ChainId.AVALANCHE]: usePairs,
  [ChainId.WAGMI]: usePairsContract,
  [ChainId.COSTON]: usePairsContract,
  [ChainId.SONGBIRD]: usePairsContract,
  [ChainId.FLARE_MAINNET]: usePairsContract,
  [ChainId.HEDERA_TESTNET]: usePairs,
  [ChainId.HEDERA_MAINNET]: usePairs,
  [ChainId.NEAR_MAINNET]: useNearPairs,
  [ChainId.NEAR_TESTNET]: useNearPairs,
  [ChainId.COSTON2]: usePairsContract,
  [ChainId.EVMOS_TESTNET]: usePairsContract,
  [ChainId.EVMOS_MAINNET]: usePairsContract,
  //TODO: We used usePairs for now, but we need to check following chains
  [ChainId.ETHEREUM]: usePairsContract,
  [ChainId.POLYGON]: usePairsContract,
  [ChainId.FANTOM]: usePairsContract,
  [ChainId.XDAI]: usePairsContract,
  [ChainId.BSC]: usePairsContract,
  [ChainId.ARBITRUM]: usePairsContract,
  [ChainId.CELO]: usePairsContract,
  [ChainId.OKXCHAIN]: usePairsContract,
  [ChainId.VELAS]: usePairsContract,
  [ChainId.AURORA]: usePairsContract,
  [ChainId.CRONOS]: usePairsContract,
  [ChainId.FUSE]: usePairsContract,
  [ChainId.MOONRIVER]: usePairsContract,
  [ChainId.MOONBEAM]: usePairsContract,
  [ChainId.OP]: usePairsContract,
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePairsContract,
};

export type UseTokenAllowanceHookType = {
  [chainId in ChainId]: typeof useTokenAllowance | typeof useDummyHook;
};

export const useTokenAllowanceHook: UseTokenAllowanceHookType = {
  [ChainId.FUJI]: useTokenAllowance,
  [ChainId.AVALANCHE]: useTokenAllowance,
  [ChainId.WAGMI]: useTokenAllowance,
  [ChainId.COSTON]: useTokenAllowance,
  [ChainId.SONGBIRD]: useTokenAllowance,
  [ChainId.FLARE_MAINNET]: useTokenAllowance,
  [ChainId.HEDERA_TESTNET]: useTokenAllowance,
  [ChainId.HEDERA_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_MAINNET]: useTokenAllowance,
  [ChainId.NEAR_TESTNET]: useTokenAllowance,
  [ChainId.COSTON2]: useTokenAllowance,
  [ChainId.EVMOS_TESTNET]: useTokenAllowance,
  [ChainId.EVMOS_MAINNET]: useTokenAllowance,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyHook,
};

export type UseTotalSupplyHookType = {
  [chainId in ChainId]:
    | typeof useTotalSupply
    | typeof useNearTotalSupply
    | typeof useDummyHook
    | typeof useHederaTotalSupply;
};

/**
 * this hook is used to fetch total supply of given token based on chain
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export const useTotalSupplyHook: UseTotalSupplyHookType = {
  [ChainId.FUJI]: useTotalSupply,
  [ChainId.AVALANCHE]: useTotalSupply,
  [ChainId.WAGMI]: useTotalSupply,
  [ChainId.COSTON]: useTotalSupply,
  [ChainId.SONGBIRD]: useTotalSupply,
  [ChainId.FLARE_MAINNET]: useTotalSupply,
  [ChainId.HEDERA_TESTNET]: useHederaTotalSupply,
  [ChainId.HEDERA_MAINNET]: useHederaTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearTotalSupply,
  [ChainId.COSTON2]: useTotalSupply,
  [ChainId.EVMOS_TESTNET]: useTotalSupply,
  [ChainId.EVMOS_MAINNET]: useTotalSupply,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyHook,
};

export type UsePairTotalSupplyHookType = {
  [chainId in ChainId]:
    | typeof useEvmPairTotalSupply
    | typeof useNearPairTotalSupply
    | typeof usePairTotalSupplyViaSubgraph
    | typeof useHederaPairTotalSupply
    | typeof useDummyHook;
};

/**
 * this hook is used to fetch total supply of given pair based on chain
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export const usePairTotalSupplyHook: UsePairTotalSupplyHookType = {
  [ChainId.FUJI]: useEvmPairTotalSupply,
  [ChainId.AVALANCHE]: useEvmPairTotalSupply,
  [ChainId.WAGMI]: useEvmPairTotalSupply,
  [ChainId.COSTON]: useEvmPairTotalSupply,
  [ChainId.SONGBIRD]: useEvmPairTotalSupply,
  [ChainId.FLARE_MAINNET]: useEvmPairTotalSupply,
  [ChainId.HEDERA_TESTNET]: useHederaPairTotalSupply,
  [ChainId.HEDERA_MAINNET]: useHederaPairTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearPairTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearPairTotalSupply,
  [ChainId.COSTON2]: useEvmPairTotalSupply,
  [ChainId.EVMOS_TESTNET]: useEvmPairTotalSupply,
  [ChainId.EVMOS_MAINNET]: useEvmPairTotalSupply,
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: useDummyHook,
};
