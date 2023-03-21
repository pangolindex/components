import { ChainId, Token } from '@pangolindex/sdk';
import { USDC, USDCe, USDTe } from './tokens';

export const COINGEKO_BASE_URL = `https://api.coingecko.com/api/v3`;

export const COINGECKO_TOKENS_MAPPING = {
  [ChainId.AVALANCHE]: {
    [USDCe[ChainId.AVALANCHE].address]: USDC[ChainId.AVALANCHE],
    [USDTe[ChainId.AVALANCHE].address]: new Token(
      ChainId.AVALANCHE,
      '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      6,
      'USDt',
      'Tether USD',
    ),
  },
};

export const COINGECKO_CURRENCY_ID: { [chainId in ChainId]: string | undefined } = {
  [ChainId.FUJI]: undefined,
  [ChainId.AVALANCHE]: 'avalanche-2',
  [ChainId.WAGMI]: undefined,
  [ChainId.COSTON]: undefined,
  [ChainId.SONGBIRD]: 'songbird',
  [ChainId.FLARE_MAINNET]: 'flare-networks',
  [ChainId.HEDERA_TESTNET]: 'hedera-hashgraph',
  [ChainId.HEDERA_MAINNET]: 'hedera-hashgraph',
  [ChainId.NEAR_MAINNET]: 'near',
  [ChainId.NEAR_TESTNET]: undefined,
  [ChainId.COSTON2]: undefined,
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.POLYGON]: 'matic-network',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.XDAI]: 'gnosis',
  [ChainId.BSC]: 'binancecoin',
  [ChainId.ARBITRUM]: 'ethereum', // arbitrum use eth as default coin
  [ChainId.CELO]: 'celo',
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: 'aurora-near',
  [ChainId.CRONOS]: 'crypto-com-chain',
  [ChainId.FUSE]: 'fuse-network-token',
  [ChainId.MOONRIVER]: 'moonriver',
  [ChainId.MOONBEAM]: 'moonbeam',
  [ChainId.OP]: 'ethereum', // optimism use eth as default coin
  [ChainId.EVMOS_TESTNET]: undefined,
  [ChainId.EVMOS_MAINNET]: 'evmos',
};
