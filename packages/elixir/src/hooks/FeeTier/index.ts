import { ChainId } from '@pangolindex/sdk';
import { useFeeTierDistribution } from './evm';

export function useDummyFeeTierDistribution() {
  return {
    isLoading: false,
    isError: false,
    largestUsageFeeTier: undefined,
    distributions: undefined,
  };
}

export type UseFeeTierDistributionHookType = {
  [chainId in ChainId]: typeof useFeeTierDistribution | typeof useDummyFeeTierDistribution;
};

export const useFeeTierDistributionHook: UseFeeTierDistributionHookType = {
  [ChainId.FUJI]: useFeeTierDistribution,
  [ChainId.AVALANCHE]: useFeeTierDistribution,
  [ChainId.WAGMI]: useDummyFeeTierDistribution,
  [ChainId.COSTON]: useDummyFeeTierDistribution,
  [ChainId.SONGBIRD]: useDummyFeeTierDistribution,
  [ChainId.FLARE_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.HEDERA_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.HEDERA_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.NEAR_MAINNET]: useDummyFeeTierDistribution,
  [ChainId.NEAR_TESTNET]: useDummyFeeTierDistribution,
  [ChainId.COSTON2]: useDummyFeeTierDistribution,
  [ChainId.EVMOS_TESTNET]: useFeeTierDistribution,
  [ChainId.EVMOS_MAINNET]: useFeeTierDistribution,
  [ChainId.ETHEREUM]: useDummyFeeTierDistribution,
  [ChainId.POLYGON]: useDummyFeeTierDistribution,
  [ChainId.FANTOM]: useDummyFeeTierDistribution,
  [ChainId.XDAI]: useDummyFeeTierDistribution,
  [ChainId.BSC]: useDummyFeeTierDistribution,
  [ChainId.ARBITRUM]: useDummyFeeTierDistribution,
  [ChainId.CELO]: useDummyFeeTierDistribution,
  [ChainId.OKXCHAIN]: useDummyFeeTierDistribution,
  [ChainId.VELAS]: useDummyFeeTierDistribution,
  [ChainId.AURORA]: useDummyFeeTierDistribution,
  [ChainId.CRONOS]: useDummyFeeTierDistribution,
  [ChainId.FUSE]: useDummyFeeTierDistribution,
  [ChainId.MOONRIVER]: useDummyFeeTierDistribution,
  [ChainId.MOONBEAM]: useDummyFeeTierDistribution,
  [ChainId.OP]: useDummyFeeTierDistribution,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useFeeTierDistribution,
};
