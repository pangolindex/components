import { ChainId } from '@pangolindex/sdk';

export type LogoSize = 24 | 48;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const PANGOLIN_TOKENS_REPO_RAW_BASE_URL = `https://raw.githubusercontent.com/pangolindex/tokens`;
export const NEWS_API_URL = `https://pangolin.hasura.app/v1/graphql`;

export const ANALYTICS_PAGE_MAPPING: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '',
  [ChainId.AVALANCHE]: 'https://info.pangolin.exchange',
  [ChainId.WAGMI]: '',
  [ChainId.COSTON]: '',
  [ChainId.SONGBIRD]: '',
  [ChainId.FLARE_MAINNET]: '',
  [ChainId.HEDERA_TESTNET]: 'https://info-hedera-testnet.pangolin.exchange',
  [ChainId.HEDERA_MAINNET]: 'https://info-hedera.pangolin.exchange',
  [ChainId.NEAR_MAINNET]: '',
  [ChainId.NEAR_TESTNET]: '',
  [ChainId.COSTON2]: '',
  [ChainId.POLYGON]: '',
  [ChainId.ETHEREUM]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
  [ChainId.EVMOS_TESTNET]: '',
  [ChainId.EVMOS_MAINNET]: '',
  [ChainId.SKALE_BELLATRIX_TESTNET]: '',
};
