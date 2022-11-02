import { ChainId, Token } from '@pangolindex/sdk';
import { USDC, USDCe, USDTe } from './tokens';

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
