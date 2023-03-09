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
  [ChainId.ETHEREUM]: undefined,
  [ChainId.POLYGON]: undefined,
  [ChainId.FANTOM]: undefined,
  [ChainId.XDAI]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.ARBITRUM]: undefined,
  [ChainId.CELO]: undefined,
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: undefined,
  [ChainId.CRONOS]: undefined,
  [ChainId.FUSE]: undefined,
  [ChainId.MOONRIVER]: undefined,
  [ChainId.MOONBEAM]: undefined,
  [ChainId.OP]: undefined,
  [ChainId.EVMOS_TESTNET]: undefined,
  [ChainId.EVMOS_MAINNET]: undefined,
};
