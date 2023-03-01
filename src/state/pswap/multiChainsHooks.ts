import { ChainId } from '@pangolindex/sdk';
import { useGelatoLimitOrderList } from './hooks';

const useDummyGelatoLimitOrdersList = () => [];

export type UseGelatoLimitOrdersListHookType = {
  [chainId in ChainId]: typeof useGelatoLimitOrderList | typeof useDummyGelatoLimitOrdersList;
};

export const useGelatoLimitOrdersListHook: UseGelatoLimitOrdersListHookType = {
  [ChainId.AVALANCHE]: useGelatoLimitOrderList,
  [ChainId.FUJI]: useGelatoLimitOrderList,
  [ChainId.WAGMI]: useGelatoLimitOrderList,
  [ChainId.COSTON]: useDummyGelatoLimitOrdersList,
  [ChainId.SONGBIRD]: useDummyGelatoLimitOrdersList,
  [ChainId.FLARE_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.HEDERA_TESTNET]: useDummyGelatoLimitOrdersList,
  [ChainId.HEDERA_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.NEAR_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.NEAR_TESTNET]: useDummyGelatoLimitOrdersList,
  [ChainId.COSTON2]: useDummyGelatoLimitOrdersList,
  [ChainId.EVMOS_TESTNET]: useDummyGelatoLimitOrdersList,
  [ChainId.EVMOS_MAINNET]: useDummyGelatoLimitOrdersList,
  [ChainId.ZKSYNC_TESTNET]: useDummyGelatoLimitOrdersList,
  //TODO: Change following chains
  [ChainId.ETHEREUM]: useDummyGelatoLimitOrdersList,
  [ChainId.POLYGON]: useDummyGelatoLimitOrdersList,
  [ChainId.FANTOM]: useDummyGelatoLimitOrdersList,
  [ChainId.XDAI]: useDummyGelatoLimitOrdersList,
  [ChainId.BSC]: useDummyGelatoLimitOrdersList,
  [ChainId.ARBITRUM]: useDummyGelatoLimitOrdersList,
  [ChainId.CELO]: useDummyGelatoLimitOrdersList,
  [ChainId.OKXCHAIN]: useDummyGelatoLimitOrdersList,
  [ChainId.VELAS]: useDummyGelatoLimitOrdersList,
  [ChainId.AURORA]: useDummyGelatoLimitOrdersList,
  [ChainId.CRONOS]: useDummyGelatoLimitOrdersList,
  [ChainId.FUSE]: useDummyGelatoLimitOrdersList,
  [ChainId.MOONRIVER]: useDummyGelatoLimitOrdersList,
  [ChainId.MOONBEAM]: useDummyGelatoLimitOrdersList,
  [ChainId.OP]: useDummyGelatoLimitOrdersList,
};
