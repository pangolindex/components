/* eslint-disable max-lines */
import { ChainId } from '@pangolindex/sdk';
import { CommonEVMProvider, HederaProvider, NearProvider } from '../WalletProviders';

export const PROVIDER_MAPPING: { [chainId in ChainId]: (provider: any) => any } = {
  [ChainId.FUJI]: CommonEVMProvider,
  [ChainId.AVALANCHE]: CommonEVMProvider,
  [ChainId.WAGMI]: CommonEVMProvider,
  [ChainId.COSTON]: CommonEVMProvider,
  [ChainId.SONGBIRD]: CommonEVMProvider,
  [ChainId.FLARE_MAINNET]: CommonEVMProvider,
  [ChainId.HEDERA_TESTNET]: HederaProvider,
  [ChainId.HEDERA_MAINNET]: HederaProvider,
  [ChainId.NEAR_MAINNET]: NearProvider,
  [ChainId.NEAR_TESTNET]: NearProvider,
  [ChainId.COSTON2]: CommonEVMProvider,
  //TODO: remove this once we have proper implementation
  [ChainId.ETHEREUM]: CommonEVMProvider,
  [ChainId.POLYGON]: CommonEVMProvider,
  [ChainId.FANTOM]: CommonEVMProvider,
  [ChainId.XDAI]: CommonEVMProvider,
  [ChainId.BSC]: CommonEVMProvider,
  [ChainId.ARBITRUM]: CommonEVMProvider,
  [ChainId.CELO]: CommonEVMProvider,
  [ChainId.OKXCHAIN]: CommonEVMProvider,
  [ChainId.VELAS]: CommonEVMProvider,
  [ChainId.AURORA]: CommonEVMProvider,
  [ChainId.CRONOS]: CommonEVMProvider,
  [ChainId.FUSE]: CommonEVMProvider,
  [ChainId.MOONRIVER]: CommonEVMProvider,
  [ChainId.MOONBEAM]: CommonEVMProvider,
  [ChainId.OP]: CommonEVMProvider,
  [ChainId.EVMOS_TESTNET]: CommonEVMProvider,
  [ChainId.EVMOS_MAINNET]: CommonEVMProvider,
  [ChainId.SKALE_BELLATRIX_TESTNET]: CommonEVMProvider,
};

/* eslint-enable max-lines */
