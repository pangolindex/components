import { ChainId } from '@pangolindex/sdk';
import { useDummyGetUserPositions } from './dummy';
import { useGetUserPositions } from './evm';

export type UseGetUserPositionsHookType = {
  [chainId in ChainId]: typeof useGetUserPositions | typeof useDummyGetUserPositions;
};

export const useGetUserPositionsHook: UseGetUserPositionsHookType = {
  [ChainId.FUJI]: useGetUserPositions,
  [ChainId.AVALANCHE]: useDummyGetUserPositions,
  [ChainId.WAGMI]: useDummyGetUserPositions,
  [ChainId.COSTON]: useDummyGetUserPositions,
  [ChainId.SONGBIRD]: useDummyGetUserPositions,
  [ChainId.FLARE_MAINNET]: useDummyGetUserPositions,
  [ChainId.HEDERA_TESTNET]: useDummyGetUserPositions,
  [ChainId.HEDERA_MAINNET]: useDummyGetUserPositions,
  [ChainId.NEAR_MAINNET]: useDummyGetUserPositions,
  [ChainId.NEAR_TESTNET]: useDummyGetUserPositions,
  [ChainId.COSTON2]: useDummyGetUserPositions,
  [ChainId.EVMOS_TESTNET]: useDummyGetUserPositions,
  [ChainId.EVMOS_MAINNET]: useDummyGetUserPositions,
  [ChainId.ETHEREUM]: useDummyGetUserPositions,
  [ChainId.POLYGON]: useDummyGetUserPositions,
  [ChainId.FANTOM]: useDummyGetUserPositions,
  [ChainId.XDAI]: useDummyGetUserPositions,
  [ChainId.BSC]: useDummyGetUserPositions,
  [ChainId.ARBITRUM]: useDummyGetUserPositions,
  [ChainId.CELO]: useDummyGetUserPositions,
  [ChainId.OKXCHAIN]: useDummyGetUserPositions,
  [ChainId.VELAS]: useDummyGetUserPositions,
  [ChainId.AURORA]: useDummyGetUserPositions,
  [ChainId.CRONOS]: useDummyGetUserPositions,
  [ChainId.FUSE]: useDummyGetUserPositions,
  [ChainId.MOONRIVER]: useDummyGetUserPositions,
  [ChainId.MOONBEAM]: useDummyGetUserPositions,
  [ChainId.OP]: useDummyGetUserPositions,
};
